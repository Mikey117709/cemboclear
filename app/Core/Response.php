<?php
declare(strict_types=1);

namespace App\Core;

class Response
{
    

    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    

    public static function error(string $message = 'An unexpected error occurred. Please try again.', int $status = 400, mixed $extra = null): never
    {
        $payload = ['error' => true, 'message' => $message];
        if ($extra !== null) {
            $payload = array_merge($payload, is_array($extra) ? $extra : ['detail' => $extra]);
        }
        self::json($payload, $status);
    }

    

    public static function unauthorized(string $message = 'Please log in to access this feature.'): never
    {
        self::json(['error' => true, 'message' => $message], 401);
    }

    

    public static function forbidden(string $message = 'You do not have permission to perform this action.'): never
    {
        self::json(['error' => true, 'message' => $message], 403);
    }

    

    public static function notFound(string $message = 'The requested item or page could not be found.'): never
    {
        self::json(['error' => true, 'message' => $message], 404);
    }

    

    public static function noContent(): never
    {
        http_response_code(204);
        exit;
    }

    

    public static function cors(): void
    {
        $allowedOrigin = config('app.base_url', 'http://localhost');
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if ($origin !== '' && (rtrim($origin, '/') === rtrim($allowedOrigin, '/'))) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
        } else {
            header('Access-Control-Allow-Origin: ' . $allowedOrigin);
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
        header('Access-Control-Max-Age: 86400');
    }
}
