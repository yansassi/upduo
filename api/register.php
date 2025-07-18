<?php
// Arquivo: register.php
header('Content-Type: application/json');
require 'db.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email e senha obrigatórios."]);
    exit;
}

$uuid = uniqid(); // ou use um gerador de UUID v4
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Verifica se o email já está cadastrado
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email já cadastrado."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO users (uuid, email, password_hash, created_at) VALUES (?, ?, ?, NOW())");
$stmt->bind_param("sss", $uuid, $email, $password_hash);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "uuid" => $uuid]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar."]);
}
?>
