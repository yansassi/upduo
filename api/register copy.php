<?php
// Arquivo: register.php

header('Access-Control-Allow-Origin: *'); // Permite requisições de qualquer origem
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); // Métodos HTTP permitidos
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Cabeçalhos permitidos

// O restante do seu código PHP vem aqui
// ...


```    *   **Explicação:**
    *   `header('Access-Control-Allow-Origin: *');`: Este cabeçalho informa ao navegador que qualquer domínio pode acessar os recursos deste servidor. Para maior segurança, você pode substituir `*` pelo domínio específico do seu frontend quando ele estiver em produção (ex: `https://seusite.com.br`).
    *   `header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');`: Define quais métodos HTTP são permitidos para requisições cross-origin.
    *   `header('Access-Control-Allow-Headers: Content-Type, Authorization');`: Especifica quais cabeçalhos de requisição podem ser usados em requisições cross-origin.

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
