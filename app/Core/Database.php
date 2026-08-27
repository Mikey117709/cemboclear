<?php
declare(strict_types=1);

namespace App\Core;

class Database
{
    private \PDO $pdo;

    public function __construct()
    {
        $host = config('db.host', '127.0.0.1');
        $port = config('db.port', '3306');
        $name = config('db.name', 'cemboclear');
        $user = config('db.user', 'root');
        $pass = config('db.pass', '');
        $charset = config('db.charset', 'utf8mb4');

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";

        $this->pdo = new \PDO($dsn, $user, $pass, [
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
            \PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    

    public function query(string $sql, array $params = []): \PDOStatement
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    

    public function execute(string $sql, array $params = []): int
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    

    public function lastInsertId(): string
    {
        return $this->pdo->lastInsertId();
    }

    

    public function beginTransaction(): bool
    {
        return $this->pdo->beginTransaction();
    }

    

    public function commit(): bool
    {
        return $this->pdo->commit();
    }

    

    public function rollBack(): bool
    {
        return $this->pdo->rollBack();
    }

    

    public function getPdo(): \PDO
    {
        return $this->pdo;
    }
}
