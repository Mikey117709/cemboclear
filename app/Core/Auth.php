<?php
declare(strict_types=1);

namespace App\Core;

class Auth
{
    

    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            $lifetime = config('session.lifetime', 7200);
            $secure = config('session.secure', false) || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
            session_set_cookie_params([
                'lifetime' => $lifetime,
                'path'     => '/',
                'httponly' => true,
                'samesite' => 'Lax',
                'secure'   => $secure,
            ]);
            session_start();
        }
    }

    

    public static function loginStaff(int $staffId, string $position = ''): void
    {
        self::start();
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }
        $_SESSION['user_id']   = $staffId;
        $_SESSION['user_type'] = 'staff';
        $_SESSION['role']      = $position;
    }

    

    public static function loginResident(int $residentId): void
    {
        self::start();
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }
        $_SESSION['user_id']   = $residentId;
        $_SESSION['user_type'] = 'resident';
        $_SESSION['role']      = 'resident';
    }

    

    public static function logout(): void
    {
        self::start();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                [
                    'expires'  => time() - 42000,
                    'path'     => $params['path'],
                    'domain'   => $params['domain'],
                    'secure'   => $params['secure'],
                    'httponly' => $params['httponly'],
                    'samesite' => $params['samesite'] ?? 'Lax',
                ]
            );
        }
        session_destroy();
    }

    

    public static function check(): bool
    {
        self::start();
        return isset($_SESSION['user_id']) && isset($_SESSION['user_type']);
    }

    

    public static function id(): ?int
    {
        self::start();
        return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
    }

    

    public static function type(): ?string
    {
        self::start();
        return $_SESSION['user_type'] ?? null;
    }

    

    public static function role(): ?string
    {
        self::start();
        return $_SESSION['role'] ?? null;
    }

    

    public static function isAdmin(): bool
    {
        self::start();
        if (self::type() !== 'staff') {
            return false;
        }
        $role = self::role();
        if ($role === null || $role === '') {
            return false;
        }
        $normalized = strtolower(trim($role));
        return str_contains($normalized, 'admin');
    }

    

    public static function requireRole(string $type = 'any'): void
    {
        if (!self::check()) {
            Response::unauthorized();
        }

        if ($type === 'admin') {
            if (!self::isAdmin()) {
                Response::forbidden();
            }
            return;
        }

        if ($type !== 'any' && self::type() !== $type) {
            Response::forbidden();
        }
    }

    

    public static function requireAdmin(): void
    {
        self::requireRole('admin');
    }
}
