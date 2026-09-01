<?php
declare(strict_types=1);

namespace App\Features\ResidentRegistryRead;

use App\Core\Database;
use App\Core\Response;
use App\Core\Auth;

class ResidentRegistryReadController
{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    

    public function index(): void
    {
        Auth::requireRole('staff');

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 25)));
        $offset = ($page - 1) * $limit;

        

        $status = trim((string)($_GET['status'] ?? ''));
        $allowedStatuses = ['pending', 'verified', 'outdated'];
        $statusClause = '';
        $statusValue = null;
        if ($status !== '' && in_array($status, $allowedStatuses, true)) {
            $statusClause = 'WHERE registry_status = ?';
            $statusValue = $status;
        }

        $sql = 'SELECT COUNT(*) as cnt FROM residents ' . $statusClause;
        $total = $statusValue !== null
            ? $this->db->query($sql, [$statusValue])->fetch()['cnt']
            : $this->db->query($sql)->fetch()['cnt'];

        $residents = $this->db->query(
            'SELECT id, email, first_name, middle_name, last_name, suffix, phone,
                    gender, birthdate, civil_status, address, purok, control_no,
                    registry_status, account_status, created_at
             FROM residents
             ' . $statusClause . '
             ORDER BY last_name, first_name
             LIMIT ? OFFSET ?',
            $statusValue !== null ? [$statusValue, $limit, $offset] : [$limit, $offset]
        )->fetchAll();

        foreach ($residents as &$r) {
            $r['id'] = (int)$r['id'];
        }

        Response::json([
            'data'  => $residents,
            'total' => (int)$total,
            'page'  => $page,
            'limit' => $limit,
        ]);
    }

    

    public function show(string $id): void
    {
        Auth::requireRole('staff');

        $resident = $this->db->query(
            'SELECT id, email, first_name, middle_name, last_name, suffix, phone,
                    gender, birthdate, civil_status, birth_place, address, purok,
                    citizenship, control_no, registry_status, account_status,
                    last_census_at, created_at, updated_at
             FROM residents WHERE id = ?',
            [(int)$id]
        )->fetch();

        if (!$resident) {
            Response::notFound('Resident not found');
        }

        $resident['id'] = (int)$resident['id'];

        

        

        $attachments = $this->db->query(
            'SELECT id, kind, file_name FROM attachments WHERE resident_id = ? ORDER BY created_at DESC',
            [(int)$id]
        )->fetchAll();
        foreach ($attachments as &$a) {
            $a['id'] = (int)$a['id'];
        }
        $resident['attachments'] = $attachments;

        Response::json($resident);
    }

    

    public function search(): void
    {
        Auth::requireRole('staff');

        $q = trim($_GET['q'] ?? '');
        if ($q === '') {
            Response::error('Search query is required.', 422);
        }

        $like = "%{$q}%";
        $residents = $this->db->query(
            'SELECT id, first_name, middle_name, last_name, gender, address, control_no, phone, registry_status,
                    last_census_at, created_at, updated_at
             FROM residents
             WHERE first_name LIKE ? OR last_name LIKE ? OR control_no LIKE ? OR phone LIKE ?
             ORDER BY last_name, first_name
             LIMIT 50',
            [$like, $like, $like, $like]
        )->fetchAll();

        foreach ($residents as &$r) {
            $r['id'] = (int)$r['id'];
        }

        Response::json(['data' => $residents]);
    }

    

    public function dashboardStats(): void
    {
        Auth::requireRole('staff');

        $total = $this->db->query('SELECT COUNT(*) as cnt FROM residents')->fetch()['cnt'];
        $verified = $this->db->query(
            "SELECT COUNT(*) as cnt FROM residents WHERE registry_status = 'verified'"
        )->fetch()['cnt'];
        $pending = $this->db->query(
            "SELECT COUNT(*) as cnt FROM residents WHERE registry_status = 'pending'"
        )->fetch()['cnt'];

        $byGender = $this->db->query(
            'SELECT gender, COUNT(*) as cnt FROM residents GROUP BY gender'
        )->fetchAll();
        foreach ($byGender as &$row) {
            $row['cnt'] = (int)$row['cnt'];
        }

        $byAge = $this->db->query(
            'SELECT
                CASE
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) < 18 THEN "Under 18"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 18 AND 30 THEN "18-30"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 31 AND 50 THEN "31-50"
                    ELSE "51+"
                END as age_group,
                COUNT(*) as cnt
             FROM residents WHERE birthdate IS NOT NULL
             GROUP BY age_group
             ORDER BY FIELD(age_group, "Under 18", "18-30", "31-50", "51+")'
        )->fetchAll();
        foreach ($byAge as &$row) {
            $row['cnt'] = (int)$row['cnt'];
        }

        $pendingRequests = $this->db->query(
            "SELECT COUNT(*) as cnt FROM requests WHERE status = 'pending_review'"
        )->fetch()['cnt'];

        $upcomingAppointments = $this->db->query(
            "SELECT COUNT(*) as cnt FROM appointments WHERE appt_date >= CURDATE() AND status = 'booked'"
        )->fetch()['cnt'];

        $freshness = $this->db->query(
            "SELECT
                COUNT(CASE WHEN DATEDIFF(CURDATE(), COALESCE(updated_at, created_at)) <= 30 THEN 1 END) as recent,
                COUNT(CASE WHEN DATEDIFF(CURDATE(), COALESCE(updated_at, created_at)) > 30 AND DATEDIFF(CURDATE(), COALESCE(updated_at, created_at)) <= 90 THEN 1 END) as warning,
                COUNT(CASE WHEN DATEDIFF(CURDATE(), COALESCE(updated_at, created_at)) > 90 OR (updated_at IS NULL AND created_at IS NULL) THEN 1 END) as stale
             FROM residents"
        )->fetch();

        $totResidents = max(1, (int)$total);
        $recentCnt = (int)($freshness['recent'] ?? 0);
        $warningCnt = (int)($freshness['warning'] ?? 0);
        $staleCnt = (int)($freshness['stale'] ?? 0);

        $recentPct = round(($recentCnt / $totResidents) * 100, 1);
        $warningPct = round(($warningCnt / $totResidents) * 100, 1);
        $stalePct = round(max(0, 100 - ($recentPct + $warningPct)), 1);

        Response::json([
            'total_residents'        => (int)$total,
            'verified_residents'     => (int)$verified,
            'pending_residents'      => (int)$pending,
            'gender_distribution'    => $byGender,
            'age_distribution'       => $byAge,
            'pending_requests'       => (int)$pendingRequests,
            'upcoming_appointments'  => (int)$upcomingAppointments,
            'data_freshness'         => [
                'updated_count'      => $recentCnt,
                'updated_pct'        => $recentPct,
                'warning_count'      => $warningCnt,
                'warning_pct'        => $warningPct,
                'stale_count'        => $staleCnt,
                'stale_pct'          => $stalePct,
            ],
        ]);
    }
}
