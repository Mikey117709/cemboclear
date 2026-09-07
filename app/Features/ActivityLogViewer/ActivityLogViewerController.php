<?php
declare(strict_types=1);

namespace App\Features\ActivityLogViewer;

use App\Core\Database;
use App\Core\Response;
use App\Core\Auth;

class ActivityLogViewerController
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
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;

        $total = $this->db->query('SELECT COUNT(*) as cnt FROM audit_logs')->fetch()['cnt'];

        $logs = $this->db->query(
            'SELECT a.id, a.action, a.ip_address, a.security_status, a.created_at,
                    s.id as staff_id, s.first_name, s.last_name, s.email,
                    CONCAT_WS(\' \', s.first_name, s.last_name) AS actor_name
             FROM audit_logs a
             LEFT JOIN staff s ON s.id = a.staff_id
             ORDER BY a.created_at DESC
             LIMIT ? OFFSET ?',
            [$limit, $offset]
        )->fetchAll();

        foreach ($logs as &$log) {
            $log['id'] = (int)$log['id'];
            $log['staff_id'] = $log['staff_id'] !== null ? (int)$log['staff_id'] : null;
        }

        Response::json([
            'data'  => $logs,
            'total' => (int)$total,
            'page'  => $page,
            'limit' => $limit,
        ]);
    }
}
