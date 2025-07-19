<?php
// Arquivo: login.php

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
