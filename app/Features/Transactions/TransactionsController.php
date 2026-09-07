<?php
declare(strict_types=1);

namespace App\Features\Transactions;

use App\Core\Database;
use App\Core\Response;
use App\Core\Auth;

class TransactionsController
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
            $transactions = $this->db->query(
                'SELECT t.id, t.description, t.amount, t.transacted_at,
                        r.id as resident_id, r.first_name, r.last_name, r.control_no
                 FROM transactions t
                 JOIN residents r ON r.id = t.resident_id
                 ORDER BY t.transacted_at DESC'
            )->fetchAll();
            foreach ($transactions as &$t) {
                $t['id'] = (int)$t['id'];
                $t['resident_id'] = (int)$t['resident_id'];
                if (isset($t['amount'])) {
                    $t['amount'] = (float)$t['amount'];
                }
            }
        } else {
            $transactions = $this->db->query(
                'SELECT id, description, amount, transacted_at
                 FROM transactions WHERE resident_id = ?
                 ORDER BY transacted_at DESC',
                [Auth::id()]
            )->fetchAll();
            foreach ($transactions as &$t) {
                $t['id'] = (int)$t['id'];
                if (isset($t['amount'])) {
                    $t['amount'] = (float)$t['amount'];
                }
            }
        }

        Response::json(['data' => $transactions]);
    }

    

    public function show(string $id): void
    {
        Auth::requireRole();

        $transaction = $this->db->query(
            'SELECT t.id, t.description, t.amount, t.transacted_at,
                    r.id as resident_id, r.first_name, r.last_name, r.control_no
             FROM transactions t
             JOIN residents r ON r.id = t.resident_id
             WHERE t.id = ?',
            [(int)$id]
        )->fetch();

        if (!$transaction) {
            Response::notFound('Transaction not found');
        }

        

        if (Auth::type() === 'resident' && (int)$transaction['resident_id'] !== Auth::id()) {
            Response::forbidden();
        }

        $transaction['id'] = (int)$transaction['id'];
        $transaction['resident_id'] = (int)$transaction['resident_id'];
        if (isset($transaction['amount'])) {
            $transaction['amount'] = (float)$transaction['amount'];
        }

        Response::json($transaction);
    }

    

    public function create(): void
    {
        Auth::requireRole('staff');

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $residentId = (int)($input['resident_id'] ?? 0);

        if ($residentId <= 0) {
            Response::error('Resident ID is required.', 422);
        }

        $resident = $this->db->query('SELECT id FROM residents WHERE id = ?', [$residentId])->fetch();
        if (!$resident) {
            Response::error('Resident not found.', 422);
        }

        $this->db->execute(
            'INSERT INTO transactions (resident_id, description, amount) VALUES (?, ?, ?)',
            [
                $residentId,
                $input['description'] ?? null,
                $input['amount'] ?? null,
            ]
        );

        Response::json([
            'message' => 'Transaction recorded',
            'id'      => (int)$this->db->lastInsertId(),
        ], 201);
    }
}
