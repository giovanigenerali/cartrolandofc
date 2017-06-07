<?php
$config = require __DIR__ . '/global.php';
$database = $config['databases']['mysql'];

//dsn de conexão usando PDO
$dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s',
    $database['hostname'],
    $database['port'],
    $database['database'],
    $database['charset']
);
$pdo = new PDO($dsn, $database['username'], $database['password']);