<?php
declare(strict_types=1);

namespace App\Features\StaffAuthentication;

use App\Core\Database;
use App\Core\Response;
use App\Core\Auth;
use App\Core\Csrf;
use App\Core\Logger;
use App\Core\RateLimiter;
use App\Core\PhoneNormalizer;

class StaffAuthenticationController
{
    private Database $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    

    public function login(): void
    {
        RateLimiter::check('login', 5, 60);

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        

        $errors = LoginValidator::validate($input);
        if (!empty($errors)) {
            Response::error(implode(' ', $errors), 422);
        }

        $identifier = trim((string)($input['email'] ?? $input['phone'] ?? $input['identifier'] ?? $input['emailOrPhone'] ?? ''));
        $password = (string)($input['password'] ?? '');

        

        $isPhone = PhoneNormalizer::isValid($identifier);
        $phoneVariations = $isPhone ? PhoneNormalizer::getVariations($identifier) : [];

        

        if ($isPhone && !empty($phoneVariations)) {
            $placeholders = implode(',', array_fill(0, count($phoneVariations), '?'));
            $user = $this->db->query(
                "SELECT id, email, password_hash, first_name, last_name, position, status
                 FROM staff WHERE email = ? OR phone IN ($placeholders) LIMIT 1",
                array_merge([$identifier], $phoneVariations)
            )->fetch();
        } else {
            $user = $this->db->query(
                'SELECT id, email, password_hash, first_name, last_name, position, status
                 FROM staff WHERE email = ? LIMIT 1',
                [$identifier]
            )->fetch();
        }

        if ($user) {
            if ($user['status'] === 'active' && password_verify($password, $user['password_hash'])) {
                Auth::loginStaff((int)$user['id'], $user['position'] ?? '');
                (new Logger($this->db))->activity('Staff login', (int)$user['id']);
                Response::json([
                    'message'    => 'Login successful',
                    'csrf_token' => Csrf::token(),
                    'user' => [
                        'id'        => (int)$user['id'],
                        'email'     => $user['email'],
                        'name'      => $user['first_name'] . ' ' . $user['last_name'],
                        'position'  => $user['position'],
                        'type'      => 'staff',
                    ],
                ]);
            }
            

            (new Logger($this->db))->log('Failed login attempt', 'unauthorized');
            Response::error('Invalid credentials.', 401);
        }

        

        if ($isPhone && !empty($phoneVariations)) {
            $placeholders = implode(',', array_fill(0, count($phoneVariations), '?'));
            $resident = $this->db->query(
                "SELECT id, email, password_hash, first_name, last_name, account_status
                 FROM residents WHERE email = ? OR phone IN ($placeholders) LIMIT 1",
                array_merge([$identifier], $phoneVariations)
            )->fetch();
        } else {
            $resident = $this->db->query(
                'SELECT id, email, password_hash, first_name, last_name, account_status
                 FROM residents WHERE email = ? LIMIT 1',
                [$identifier]
            )->fetch();
        }

        if ($resident) {
            if ($resident['account_status'] === 'active' && password_verify($password, $resident['password_hash'])) {
                Auth::loginResident((int)$resident['id']);
                Response::json([
                    'message'    => 'Login successful',
                    'csrf_token' => Csrf::token(),
                    'user' => [
                        'id'    => (int)$resident['id'],
                        'email' => $resident['email'],
                        'name'  => $resident['first_name'] . ' ' . $resident['last_name'],
                        'type'  => 'resident',
                    ],
                ]);
            }
            Response::error('Invalid credentials.', 401);
        }

        Response::error('Invalid credentials.', 401);
    }

    

    public function logout(): void
    {
        Auth::requireRole('any');
        Auth::logout();
        Response::json(['message' => 'Logged out']);
    }

    

    public function me(): void
    {
        if (!Auth::check()) {
            Response::unauthorized();
        }

        $id = Auth::id();
        $type = Auth::type();

        if ($type === 'staff') {
            $user = $this->db->query(
                'SELECT id, email, first_name, middle_name, last_name, position, branch, phone, status
                 FROM staff WHERE id = ?',
                [$id]
            )->fetch();
            if (!$user) Response::notFound();
            $user['id'] = (int)$user['id'];
            $user['type'] = 'staff';
            $user['csrf_token'] = Csrf::token();
            Response::json($user);
        }

        if ($type === 'resident') {
            $user = $this->db->query(
                'SELECT id, email, first_name, middle_name, last_name, suffix, phone, gender, birthdate,
                        civil_status, address, purok, control_no, registry_status, account_status
                 FROM residents WHERE id = ?',
                [$id]
            )->fetch();
            if (!$user) Response::notFound();
            $user['id'] = (int)$user['id'];
            $user['type'] = 'resident';
            $user['csrf_token'] = Csrf::token();
            Response::json($user);
        }

        Response::unauthorized();
    }
}
