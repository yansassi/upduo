<?php
// Arquivo: login.php
header('Content-Type: application/json');
require 'db.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email e senha obrigatórios."]);
    exit;
}

$stmt = $conn->prepare("SELECT uuid, password_hash FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    if (password_verify($password, $user['password_hash'])) {
        // Atualiza a data do último login
        $update = $conn->prepare("UPDATE users SET last_sign_in_at = NOW() WHERE uuid = ?");
        $update->bind_param("s", $user['uuid']);
        $update->execute();

        echo json_encode(["success" => true, "uuid" => $user['uuid']]);
    } else {
        echo json_encode(["success" => false, "message" => "Senha incorreta."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
}
?>
