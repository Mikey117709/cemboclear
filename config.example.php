<?php

return [
    'db' => [
        'host'    => getenv('DB_HOST')    ?: '127.0.0.1',
        'port'    => getenv('DB_PORT')    ?: '3306',
        'name'    => getenv('DB_NAME')    ?: 'cemboclear',
        'user'    => getenv('DB_USER')    ?: 'root',
        'pass'    => getenv('DB_PASS')    ?: '',
        'charset' => 'utf8mb4',
    ],

    'app' => [
        'name'     => 'CemboClear',
        'env'      => getenv('APP_ENV')   ?: 'production',
        'debug'    => getenv('APP_DEBUG') ?: false,
        'base_url' => getenv('APP_URL')   ?: 'http://localhost',
    ],

    'session' => [
        'lifetime' => 7200,
    ],

    'upload' => [
        'max_size'      => 5 * 1024 * 1024,
        'allowed_types' => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    ],
];
