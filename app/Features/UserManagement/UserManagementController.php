<?php
declare(strict_types=1);

namespace App\Features\UserManagement;

use App\Core\Database;
use App\Core\Response;
use App\Core\Auth;
use App\Core\Logger;

class UserManagementController
{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    

    public function index(): void
    {
        Auth::requireAdmin();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 25)));
        $offset = ($page - 1) * $limit;

        

        $q = trim((string)($_GET['q'] ?? ''));
        $where = '';
        $searchParams = [];
        if ($q !== '') {
            $like = "%{$q}%";
            $where = 'WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
                     OR position LIKE ? OR branch LIKE ?
                     OR CONCAT(first_name, \' \', last_name) LIKE ?';
            $searchParams = [$like, $like, $like, $like, $like, $like];
        }

        $total = $this->db->query(
            'SELECT COUNT(*) as cnt FROM staff ' . $where,
            $searchParams
        )->fetch()['cnt'];

        $staff = $this->db->query(
            'SELECT id, email, first_name, middle_name, last_name, position, branch,
                    phone, is_verified, status, created_at
             FROM staff
             ' . $where . '
             ORDER BY last_name, first_name
             LIMIT ? OFFSET ?',
            array_merge($searchParams, [$limit, $offset])
        )->fetchAll();

        foreach ($staff as &$s) {
            $s['id'] = (int)$s['id'];
            $s['is_verified'] = (int)$s['is_verified'];
        }

        Response::json([
            'data'  => $staff,
            'total' => (int)$total,
            'page'  => $page,
            'limit' => $limit,
        ]);
    }

    

    public function create(): void
    {
        Auth::requireAdmin();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $required = ['email', 'password', 'first_name', 'last_name'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::error("Field '{$field}' is required.", 422);
            }
        }

        

        $password = (string)$input['password'];
        $passwordErrors = self::validatePassword($password);
        if (!empty($passwordErrors)) {
            Response::error(implode(' ', $passwordErrors), 422);
        }

        $email = trim($input['email']);

        

        $existing = $this->db->query(
            'SELECT id FROM staff WHERE email = ? UNION SELECT id FROM residents WHERE email = ?',
            [$email, $email]
        )->fetch();
        if ($existing) {
            Response::error('Email is already registered.', 409);
        }

        $this->db->execute(
            'INSERT INTO staff (email, password_hash, first_name, middle_name, last_name, position, branch, phone, birthdate)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $email,
                password_hash($password, PASSWORD_DEFAULT),
                trim($input['first_name']),
                $input['middle_name'] ?? null,
                trim($input['last_name']),
                $input['position'] ?? null,
                $input['branch'] ?? null,
                $input['phone'] ?? null,
                $input['birthdate'] ?? null,
            ]
        );

        (new Logger($this->db))->activity(
            'Created staff account: ' . $email,
            Auth::id()
        );

        Response::json([
            'message' => 'Staff account created',
            'id'      => (int)$this->db->lastInsertId(),
        ], 201);
    }

    

    public function update(string $id): void
    {
        Auth::requireAdmin();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $staffId = (int)$id;

        $existing = $this->db->query('SELECT id FROM staff WHERE id = ?', [$staffId])->fetch();
        if (!$existing) {
            Response::notFound('Staff not found');
        }

        $allowed = [
            'first_name', 'middle_name', 'last_name', 'phone',
            'position', 'branch', 'birthdate',
        ];

        $sets = [];
        $values = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $input)) {
                $sets[] = "{$field} = ?";
                $values[] = $input[$field];
            }
        }

        

        if (!empty($input['password'])) {
            $sets[] = 'password_hash = ?';
            $values[] = password_hash($input['password'], PASSWORD_DEFAULT);
        }

        if (empty($sets)) {
            Response::error('No valid fields to update.', 422);
        }

        $values[] = $staffId;
        $this->db->execute(
            'UPDATE staff SET ' . implode(', ', $sets) . ' WHERE id = ?',
            $values
        );

        (new Logger($this->db))->activity(
            'Updated staff #' . $staffId,
            Auth::id()
        );

        Response::json(['message' => 'Staff updated']);
    }

    

    public function updateStatus(string $id): void
    {
        Auth::requireAdmin();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $input['status'] ?? '';

        if (!in_array($status, ['active', 'inactive'], true)) {
            Response::error('Status must be "active" or "inactive".', 422);
        }

        $staffId = (int)$id;
        $existing = $this->db->query('SELECT id FROM staff WHERE id = ?', [$staffId])->fetch();
        if (!$existing) {
            Response::notFound('Staff not found');
        }

        $this->db->execute(
            'UPDATE staff SET status = ? WHERE id = ?',
            [$status, $staffId]
        );

        (new Logger($this->db))->activity(
            'Set staff #' . $staffId . ' status to ' . $status,
            Auth::id()
        );

        Response::json(['message' => 'Status updated']);
    }

    

    private static function validatePassword(string $password): array
    {
        $errors = [];
        if (mb_strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters long.';
        }
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter.';
        }
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter.';
        }
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number.';
        }
        if (!preg_match('/[\W_]/', $password)) {
            $errors[] = 'Password must contain at least one special character.';
        }
        return $errors;
    }
}
