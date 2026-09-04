<?php
declare(strict_types=1);

namespace App\Features\AppointmentScheduling;

use App\Core\Database;
use App\Core\Response;
use App\Core\Auth;

class AppointmentSchedulingController
{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    

    public function availableSlots(): void
    {
        Auth::requireRole('resident');

        $date = $_GET['date'] ?? '';
        if ($date === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            Response::error('Valid date parameter is required (YYYY-MM-DD).', 422);
        }

        

        

        $allSlots = [
            '8:00 - 9:00'     => 8,
            '9:00 - 10:00'    => 9,
            '10:00 - 11:00'   => 10,
            '11:00 - 12:00'   => 11,
            '1:00 - 2:00'     => 13,
            '2:00 - 3:00'     => 14,
            '3:00 - 4:00'     => 15,
            '4:00 - 5:00'     => 16,
        ];

        

        

        

        $now = new \DateTimeImmutable('now', new \DateTimeZone('Asia/Manila'));

        

        $booked = $this->db->query(
            "SELECT time_slot FROM appointments WHERE appt_date = ? AND status = 'booked'",
            [$date]
        )->fetchAll(\PDO::FETCH_COLUMN);

        

        

        

        $isToday = ($date === $now->format('Y-m-d'));
        $currentHour = (int)$now->format('H');

        $available = [];
        foreach ($allSlots as $slot => $startHour) {
            $alreadyStarted = $isToday && $currentHour >= $startHour;
            $available[] = [
                'time_slot' => $slot,
                'available' => !in_array($slot, $booked, true) && !$alreadyStarted,
                'expired'   => (bool)$alreadyStarted,
            ];
        }

        Response::json(['date' => $date, 'slots' => $available]);
    }

    

    public function book(): void
    {
        Auth::requireRole('resident');

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $date = $input['date'] ?? '';
        $timeSlot = $input['time_slot'] ?? '';

        if ($date === '' || $timeSlot === '') {
            Response::error('Date and time_slot are required.', 422);
        }

        $this->db->beginTransaction();

        try {
            

            $now = new \DateTimeImmutable('now', new \DateTimeZone('Asia/Manila'));

            

            $slotStartHours = [
                '8:00 - 9:00' => 8, '9:00 - 10:00' => 9, '10:00 - 11:00' => 10, '11:00 - 12:00' => 11,
                '1:00 - 2:00' => 13, '2:00 - 3:00' => 14, '3:00 - 4:00' => 15, '4:00 - 5:00' => 16,
            ];
            if ($date === $now->format('Y-m-d')) {
                $startHour = $slotStartHours[$timeSlot] ?? null;
                if ($startHour !== null && (int)$now->format('H') >= $startHour) {
                    $this->db->rollBack();
                    Response::error('This time slot has already started and can no longer be booked.', 422);
                }
            }

            

            $existing = $this->db->query(
                "SELECT id FROM appointments
                 WHERE appt_date = ? AND time_slot = ? AND status = 'booked'
                 FOR UPDATE",
                [$date, $timeSlot]
            )->fetch();

            if ($existing) {
                $this->db->rollBack();
                Response::error('This time slot is already booked.', 409);
            }

            $this->db->execute(
                'INSERT INTO appointments (resident_id, appt_date, time_slot) VALUES (?, ?, ?)',
                [Auth::id(), $date, $timeSlot]
            );

            $id = (int)$this->db->lastInsertId();
            $this->db->commit();

            Response::json([
                'message'   => 'Appointment booked',
                'id'        => $id,
                'date'      => $date,
                'time_slot' => $timeSlot,
            ], 201);

        } catch (\Throwable $e) {
            $this->db->rollBack();
            Response::error('Failed to book appointment.', 500);
        }
    }
}
