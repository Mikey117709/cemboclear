<?php
declare(strict_types=1);

namespace App\Features\Notifications;

use App\Core\Database;
use App\Core\Response;
use App\Core\Auth;

class NotificationsController
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

        if ($type === 'staff') {
            $notifications = $this->db->query(
                'SELECT id, message, is_read, created_at
                 FROM notifications WHERE staff_id = ?
                 ORDER BY created_at DESC
                 LIMIT 50',
                [$id]
            )->fetchAll();
        } else {
            $notifications = $this->db->query(
                'SELECT id, message, is_read, created_at
                 FROM notifications WHERE resident_id = ?
                 ORDER BY created_at DESC
                 LIMIT 50',
                [$id]
            )->fetchAll();
        }

        foreach ($notifications as &$n) {
            $n['id'] = (int)$n['id'];
            $n['is_read'] = (int)$n['is_read'];
        }

        Response::json(['data' => $notifications]);
    }

    

    public function markRead(string $id): void
    {
        Auth::requireRole();

        $userId = Auth::id();
        $userType = Auth::type();
        $notifId = (int)$id;

        $ownerColumn = ($userType === 'staff') ? 'staff_id' : 'resident_id';

        $existing = $this->db->query(
            "SELECT id FROM notifications WHERE id = ? AND {$ownerColumn} = ?",
            [$notifId, $userId]
        )->fetch();

        if (!$existing) {
            Response::notFound('Notification not found');
        }

        $this->db->execute(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND {$ownerColumn} = ?",
            [$notifId, $userId]
        );

        Response::json(['message' => 'Marked as read']);
    }
}
