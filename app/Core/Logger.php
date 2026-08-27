<?php
declare(strict_types=1);

namespace App\Core;

class Logger
{
    private Database $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    

    public function log(
        string $action,
        string $securityStatus = 'authorized',
        ?int $staffId = null
    ): void {
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;

        $this->db->execute(
            'INSERT INTO audit_logs (staff_id, action, ip_address, security_status)
             VALUES (?, ?, ?, ?)',
            [$staffId, $action, $ip, $securityStatus]
        );
    }

    

    public function activity(string $action, ?int $staffId = null): void
    {
        $this->log($action, 'authorized', $staffId);
    }

    

    public function recent(int $limit = 50): array
    {
        return $this->db->query(
            'SELECT a.*, s.first_name, s.last_name, s.email
             FROM audit_logs a
             LEFT JOIN staff s ON s.id = a.staff_id
             ORDER BY a.created_at DESC
             LIMIT ?',
            [$limit]
        )->fetchAll();
    }
}
