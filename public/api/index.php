<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/app/Core/helpers.php';

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    $baseDir = dirname(__DIR__, 2) . '/app/';

    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }

    $relativeClass = substr($class, strlen($prefix));
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

use App\Core\Router;
use App\Core\Response;
use App\Core\Auth;
use App\Core\Csrf;
use App\Core\ErrorHandler;

ErrorHandler::register();

Auth::start();

Response::cors();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Response::noContent();
}

Csrf::check();

$router = new Router();
require dirname(__DIR__, 2) . '/app/routes.php';

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH) ?: '/';

$scriptPath = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
$base = rtrim(str_replace('\\', '/', dirname(dirname($scriptPath))), '/');
if ($base !== '' && $base !== '/' && str_starts_with($path, $base . '/')) {
    $path = substr($path, strlen($base));
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $matched = $router->dispatch($method, $path);

    if (!$matched) {
        Response::notFound('The requested endpoint could not be found.');
    }
} catch (\Throwable $e) {
    ErrorHandler::handleException($e);
}
