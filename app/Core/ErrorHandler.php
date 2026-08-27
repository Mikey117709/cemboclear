<?php
declare(strict_types=1);

namespace App\Core;



class ErrorHandler
{
    

    public static function register(): void
    {
        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
        register_shutdown_function([self::class, 'handleShutdown']);
    }

    

    public static function handleError(int $errno, string $errstr, string $errfile, int $errline): bool
    {
        if ((error_reporting() & $errno) === 0) {
            return false;
        }

        

        if (PHP_SAPI === 'cli' && (str_contains($errstr, 'session') || str_contains($errstr, 'Session'))) {
            return true;
        }

        self::logError("PHP Error ({$errno}): {$errstr} in {$errfile} on line {$errline}");

        

        if (in_array($errno, [E_USER_ERROR, E_RECOVERABLE_ERROR, E_PARSE, E_COMPILE_ERROR], true)) {
            Response::error('Something went wrong on our end. Please try again later.', 500);
        }

        return true;
    }

    

    public static function handleException(\Throwable $exception): void
    {
        self::logError("Uncaught Exception (" . get_class($exception) . "): " . $exception->getMessage() . "\nTrace: " . $exception->getTraceAsString());
        Response::error('Something went wrong on our end. Please try again later.', 500);
    }

    

    public static function handleShutdown(): void
    {
        $error = error_get_last();
        if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
            self::logError("Fatal Error ({$error['type']}): {$error['message']} in {$error['file']} on line {$error['line']}");
            Response::error('Something went wrong on our end. Please try again later.', 500);
        }
    }

    

    private static function logError(string $message): void
    {
        $logDir = storage_path('logs');
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        $logFile = $logDir . '/error.log';
        $timestamp = date('Y-m-d H:i:s');
        @file_put_contents($logFile, "[{$timestamp}] {$message}\n", FILE_APPEND | LOCK_EX);
    }
}
