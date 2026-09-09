<?php
declare(strict_types=1);

namespace App\Features\MailBox;

use App\Core\Database;
use App\Core\Response;
use App\Core\Auth;

class MailBoxController
{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    

    public function index(): void
    {
        Auth::requireRole();

        $id = Auth::id();
        $type = Auth::type();

        $folder = trim((string)($_GET['folder'] ?? 'inbox'));
        $archivedClause = $folder === 'archived' ? 'm.is_archived = 1' : 'm.is_archived = 0';

        $baseSelect =
            'SELECT m.id, m.subject, m.body, m.is_read, m.is_archived, m.created_at,
                    m.sender_staff_id, m.sender_resident_id,
                    COALESCE(
                        NULLIF(CONCAT_WS(\' \', s.first_name, s.last_name), \'\'),
                        NULLIF(CONCAT_WS(\' \', r.first_name, r.last_name), \'\'),
                        \'Staff\'
                    ) AS sender_name,
                    COALESCE(s.email, r.email) AS sender_email
             FROM mail m
             LEFT JOIN staff s ON s.id = m.sender_staff_id
             LEFT JOIN residents r ON r.id = m.sender_resident_id
             WHERE ';

        if ($type === 'staff') {
            $messages = $this->db->query(
                $baseSelect . 'm.recipient_staff_id = ? AND ' . $archivedClause . ' ORDER BY m.created_at DESC',
                [$id]
            )->fetchAll();
        } else {
            $messages = $this->db->query(
                $baseSelect . 'm.recipient_resident_id = ? AND ' . $archivedClause . ' ORDER BY m.created_at DESC',
                [$id]
            )->fetchAll();
        }

        foreach ($messages as &$msg) {
            $msg['id'] = (int)$msg['id'];
            $msg['is_read'] = (int)$msg['is_read'];
            $msg['is_archived'] = (int)($msg['is_archived'] ?? 0);
            $msg['sender_staff_id'] = $msg['sender_staff_id'] !== null ? (int)$msg['sender_staff_id'] : null;
            $msg['sender_resident_id'] = $msg['sender_resident_id'] !== null ? (int)$msg['sender_resident_id'] : null;
        }

        Response::json(['data' => $messages]);
    }

    

    public function send(): void
    {
        Auth::requireRole();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = Auth::id();
        $type = Auth::type();

        $recipientId = (int)($input['recipient_id'] ?? 0);
        $recipientType = $input['recipient_type'] ?? '';
        $subject = trim((string)($input['subject'] ?? ''));
        $body = trim((string)($input['body'] ?? ''));

        if ($recipientId <= 0 || !in_array($recipientType, ['staff', 'resident'], true)) {
            Response::error('Valid recipient_id and recipient_type are required.', 422);
        }
        if ($subject === '' && $body === '') {
            Response::error('Subject or body is required.', 422);
        }

        

        if ($recipientType === 'staff') {
            $exists = $this->db->query('SELECT id FROM staff WHERE id = ?', [$recipientId])->fetch();
            if (!$exists) {
                Response::error('Recipient staff account not found.', 422);
            }
        } else {
            $exists = $this->db->query('SELECT id FROM residents WHERE id = ?', [$recipientId])->fetch();
            if (!$exists) {
                Response::error('Recipient resident account not found.', 422);
            }
        }

        $senderStaff = $type === 'staff' ? $id : null;
        $senderResident = $type === 'resident' ? $id : null;
        $recipientStaff = $recipientType === 'staff' ? $recipientId : null;
        $recipientResident = $recipientType === 'resident' ? $recipientId : null;

        $this->db->execute(
            'INSERT INTO mail (sender_staff_id, sender_resident_id, recipient_staff_id, recipient_resident_id, subject, body)
             VALUES (?, ?, ?, ?, ?, ?)',
            [$senderStaff, $senderResident, $recipientStaff, $recipientResident, $subject, $body]
        );

        Response::json(['message' => 'Message sent', 'id' => (int)$this->db->lastInsertId()], 201);
    }

    

    public function markRead(string $id): void
    {
        Auth::requireRole();

        $userId = Auth::id();
        $userType = Auth::type();
        $mailId = (int)$id;

        $recipientColumn = ($userType === 'staff') ? 'recipient_staff_id' : 'recipient_resident_id';

        $existing = $this->db->query(
            "SELECT id FROM mail WHERE id = ? AND {$recipientColumn} = ?",
            [$mailId, $userId]
        )->fetch();

        if (!$existing) {
            Response::notFound('Mail not found');
        }

        $this->db->execute(
            "UPDATE mail SET is_read = 1 WHERE id = ? AND {$recipientColumn} = ?",
            [$mailId, $userId]
        );

        Response::json(['message' => 'Marked as read']);
    }

    

    public function archive(string $id): void
    {
        Auth::requireRole();

        $userId = Auth::id();
        $userType = Auth::type();
        $mailId = (int)$id;

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $archived = array_key_exists('archived', $input) ? (int)$input['archived'] : 1;
        if ($archived !== 0 && $archived !== 1) {
            Response::error('archived must be 0 or 1.', 422);
        }

        $recipientColumn = ($userType === 'staff') ? 'recipient_staff_id' : 'recipient_resident_id';

        $existing = $this->db->query(
            "SELECT id FROM mail WHERE id = ? AND {$recipientColumn} = ?",
            [$mailId, $userId]
        )->fetch();

        if (!$existing) {
            Response::notFound('Mail not found');
        }

        $this->db->execute(
            "UPDATE mail SET is_archived = ? WHERE id = ? AND {$recipientColumn} = ?",
            [$archived, $mailId, $userId]
        );

        Response::json(['message' => $archived ? 'Message archived' : 'Message restored']);
    }

    

    public function searchRecipients(): void
    {
        Auth::requireRole();

        $q = trim($_GET['q'] ?? '');
        if ($q === '') {
            Response::json(['data' => []]);
            return;
        }

        $like = "%{$q}%";

        

        $isResident = Auth::type() === 'resident';

        $residents = $isResident ? [] : $this->db->query(
            "SELECT id, first_name, middle_name, last_name, control_no
             FROM residents
             WHERE first_name LIKE ? OR last_name LIKE ? OR CONCAT(first_name, ' ', last_name) LIKE ? OR control_no LIKE ?
             ORDER BY last_name, first_name
             LIMIT 25",
            [$like, $like, $like, $like]
        )->fetchAll();

        $staff = $this->db->query(
            "SELECT id, first_name, middle_name, last_name, position
             FROM staff
             WHERE first_name LIKE ? OR last_name LIKE ? OR CONCAT(first_name, ' ', last_name) LIKE ?
             ORDER BY last_name, first_name
             LIMIT 25",
            [$like, $like, $like]
        )->fetchAll();

        $results = [];
        foreach ($residents as $r) {
            $results[] = [
                'id'         => (int)$r['id'],
                'type'       => 'resident',
                'name'       => trim(($r['first_name'] ?? '') . ' ' . ($r['middle_name'] ?? '') . ' ' . ($r['last_name'] ?? '')),
                'first_name' => $r['first_name'] ?? '',
                'last_name'  => $r['last_name'] ?? '',
                'control_no' => $r['control_no'] ?? null,
            ];
        }
        foreach ($staff as $s) {
            $results[] = [
                'id'         => (int)$s['id'],
                'type'       => 'staff',
                'name'       => trim(($s['first_name'] ?? '') . ' ' . ($s['middle_name'] ?? '') . ' ' . ($s['last_name'] ?? '')),
                'first_name' => $s['first_name'] ?? '',
                'last_name'  => $s['last_name'] ?? '',
                'control_no' => $s['position'] ?? null,
            ];
        }

        Response::json(['data' => $results]);
    }
}
