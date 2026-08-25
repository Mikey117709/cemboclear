<?php

$root = dirname(__DIR__, 2);
$configFile = $root . '/config.php';

if (!file_exists($configFile)) {
    $configFile = $root . '/config.example.php';
}

return require $configFile;
