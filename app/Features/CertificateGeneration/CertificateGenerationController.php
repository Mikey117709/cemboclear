<?php
declare(strict_types=1);

namespace App\Features\CertificateGeneration;

use App\Core\Database;
use App\Core\Response;
use App\Core\Auth;
use App\Core\Logger;

class CertificateGenerationController
{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    

    public function index(): void
    {
        Auth::requireRole();

        if (Auth::type() === 'staff') {
            $certs = $this->db->query(
                'SELECT c.id, c.status, c.applied_at,
                        r.id as resident_id, r.first_name, r.last_name, r.control_no,
                        p.name as purpose
                 FROM certificate_applications c
                 JOIN residents r ON r.id = c.resident_id
                 JOIN certificate_purposes p ON p.id = c.purpose_id
                 ORDER BY c.applied_at DESC'
            )->fetchAll();
            foreach ($certs as &$c) {
                $c['id'] = (int)$c['id'];
                $c['resident_id'] = (int)$c['resident_id'];
            }
        } else {
            $certs = $this->db->query(
                'SELECT c.id, c.status, c.applied_at, p.name as purpose
                 FROM certificate_applications c
                 JOIN certificate_purposes p ON p.id = c.purpose_id
                 WHERE c.resident_id = ?
                 ORDER BY c.applied_at DESC',
                [Auth::id()]
            )->fetchAll();
            foreach ($certs as &$c) {
                $c['id'] = (int)$c['id'];
            }
        }

        Response::json(['data' => $certs]);
    }

    

    public function purposes(): void
    {
        Auth::requireRole();

        $purposes = $this->db->query(
            'SELECT id, name FROM certificate_purposes ORDER BY name'
        )->fetchAll();

        foreach ($purposes as &$p) {
            $p['id'] = (int)$p['id'];
        }

        Response::json(['data' => $purposes]);
    }

    

    public function apply(): void
    {
        Auth::requireRole('resident');

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $purposeId = (int)($input['purpose_id'] ?? 0);

        if ($purposeId <= 0) {
            Response::error('Purpose is required.', 422);
        }

        

        $purpose = $this->db->query(
            'SELECT id FROM certificate_purposes WHERE id = ?',
            [$purposeId]
        )->fetch();
        if (!$purpose) {
            Response::error('Invalid purpose.', 422);
        }

        $residentId = Auth::id();

        

        

        $hasSignature = $this->db->query(
            "SELECT COUNT(*) as cnt FROM attachments WHERE resident_id = ? AND kind = 'signature'",
            [$residentId]
        )->fetch()['cnt'];
        if ((int)$hasSignature === 0) {
            Response::error('A signature is required before applying for a certificate.', 422);
        }

        $hasValidId = $this->db->query(
            "SELECT COUNT(*) as cnt FROM attachments WHERE resident_id = ? AND kind = 'valid_id'",
            [$residentId]
        )->fetch()['cnt'];
        if ((int)$hasValidId === 0) {
            Response::error('A valid government ID is required before applying for a certificate.', 422);
        }

        $this->db->execute(
            'INSERT INTO certificate_applications (resident_id, purpose_id) VALUES (?, ?)',
            [$residentId, $purposeId]
        );

        Response::json(['message' => 'Application submitted', 'id' => (int)$this->db->lastInsertId()], 201);
    }

    

    public function approve(string $id): void
    {
        Auth::requireRole('staff');

        $certId = (int)$id;
        $existing = $this->db->query('SELECT id FROM certificate_applications WHERE id = ?', [$certId])->fetch();
        if (!$existing) {
            Response::notFound('Certificate application not found');
        }

        $this->db->execute(
            "UPDATE certificate_applications SET status = 'approved' WHERE id = ?",
            [$certId]
        );

        (new Logger($this->db))->activity(
            'Approved certificate #' . $certId,
            Auth::id()
        );

        Response::json(['message' => 'Certificate approved']);
    }

    

    public function reject(string $id): void
    {
        Auth::requireRole('staff');

        $certId = (int)$id;
        $existing = $this->db->query('SELECT id FROM certificate_applications WHERE id = ?', [$certId])->fetch();
        if (!$existing) {
            Response::notFound('Certificate application not found');
        }

        $this->db->execute(
            "UPDATE certificate_applications SET status = 'rejected' WHERE id = ?",
            [$certId]
        );

        (new Logger($this->db))->activity(
            'Rejected certificate #' . $certId,
            Auth::id()
        );

        Response::json(['message' => 'Certificate rejected']);
    }
}
