<?php
declare(strict_types=1);

namespace App\Core;

class Router
{
    

    private array $routes = [];

    

    public function get(string $path, callable|array $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    

    public function post(string $path, callable|array $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    

    public function put(string $path, callable|array $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    

    public function delete(string $path, callable|array $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    

    private function addRoute(string $method, string $path, callable|array $handler): void
    {
        

        $pattern = preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $path);
        $pattern = '#^' . $pattern . '$#';

        $this->routes[] = [
            'method'  => $method,
            'pattern' => $pattern,
            'handler' => $handler,
        ];
    }

    

    public function dispatch(string $method, string $uri): bool
    {
        

        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        

        

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $path, $matches)) {
                

                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                $handler = $route['handler'];
                

                

                if (is_array($handler)) {
                    [$class, $method] = $handler;
                    $handler = [new $class(), $method];
                }

                call_user_func_array($handler, array_values($params));
                return true;
            }
        }

        return false;
    }
}
