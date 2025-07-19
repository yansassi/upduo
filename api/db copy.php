<?php
// Arquivo: db.php

header('Access-Control-Allow-Origin: *'); // Permite requisições de qualquer origem
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); // Métodos HTTP permitidos
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Cabeçalhos permitidos

// O restante do seu código PHP vem aqui
// ...


```    *   **Explicação:**
    *   `header('Access-Control-Allow-Origin: *');`: Este cabeçalho informa ao navegador que qualquer domínio pode acessar os recursos deste servidor. Para maior segurança, você pode substituir `*` pelo domínio específico do seu frontend quando ele estiver em produção (ex: `https://seusite.com.br`).
    *   `header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');`: Define quais métodos HTTP são permitidos para requisições cross-origin.
    *   `header('Access-Control-Allow-Headers: Content-Type, Authorization');`: Especifica quais cabeçalhos de requisição podem ser usados em requisições cross-origin.



$host = 'localhost';
$db   = 'yanfer91_upduo';
$user = 'yanfer91_useradm';
$pass = '@YFS23aea06nrs';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}
?>
