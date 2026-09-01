<?php
declare(strict_types=1);

namespace App\Features\ResidentRegistryWrite;

use App\Core\Database;
use App\Core\Response;
use App\Core\Auth;
use App\Core\Logger;

class ResidentRegistryWriteController
{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    

    public function update(string $id): void
    {
        Auth::requireRole('staff');

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $residentId = (int)$id;

        

        $existing = $this->db->query('SELECT id FROM residents WHERE id = ?', [$residentId])->fetch();
        if (!$existing) {
            Response::notFound('Resident not found');
        }

        if (array_key_exists('gender', $input) && $input['gender'] !== null) {
            if (!in_array($input['gender'], ['male', 'female', 'other'], true)) {
                Response::error('Gender must be "male", "female", or "other".', 422);
            }
        }

        $allowed = [
            'first_name', 'middle_name', 'last_name', 'suffix', 'phone',
            'gender', 'birthdate', 'civil_status', 'birth_place', 'address',
            'purok', 'citizenship', 'control_no', 'registry_status',
        ];

        $sets = [];
        $values = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $input)) {
                $sets[] = "{$field} = ?";
                $values[] = $input[$field];
            }
        }

        if (empty($sets)) {
            Response::error('No valid fields to update.', 422);
        }

        $values[] = $residentId;
        $this->db->execute(
            'UPDATE residents SET ' . implode(', ', $sets) . ' WHERE id = ?',
            $values
        );

        (new Logger($this->db))->activity(
            'Updated resident #' . $residentId,
            Auth::id()
        );

        Response::json(['message' => 'Resident updated']);
    }

    

    public function verify(string $id): void
    {
        Auth::requireRole('staff');

        $residentId = (int)$id;
        $existing = $this->db->query('SELECT id FROM residents WHERE id = ?', [$residentId])->fetch();
        if (!$existing) {
            Response::notFound('Resident not found');
        }

        $this->db->execute(
            "UPDATE residents SET is_verified = 1, registry_status = 'verified' WHERE id = ?",
            [$residentId]
        );

        (new Logger($this->db))->activity(
            'Verified resident #' . $residentId,
            Auth::id()
        );

        Response::json(['message' => 'Resident verified']);
    }

    

    public function updateStatus(string $id): void
    {
        Auth::requireRole('staff');

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $input['status'] ?? '';

        if (!in_array($status, ['active', 'inactive'], true)) {
            Response::error('Status must be "active" or "inactive".', 422);
        }

        $residentId = (int)$id;
        $existing = $this->db->query('SELECT id FROM residents WHERE id = ?', [$residentId])->fetch();
        if (!$existing) {
            Response::notFound('Resident not found');
        }

        $this->db->execute(
            'UPDATE residents SET account_status = ? WHERE id = ?',
            [$status, $residentId]
        );

        (new Logger($this->db))->activity(
            'Set resident #' . $residentId . ' status to ' . $status,
            Auth::id()
        );

        Response::json(['message' => 'Status updated']);
    }
}
