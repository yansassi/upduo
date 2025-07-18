<?php
// Arquivo: db.php
$host = 'localhost';
$db   = 'yanfer91_upduo';
$user = 'yanfer91_useradm';
$pass = '@YFS23aea06nrs';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}
?>
