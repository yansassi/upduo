# UpDuo - Mobile Legends Duo Finder

Aplicativo para encontrar duos no Mobile Legends baseado em compatibilidade de jogo.

## Migração para Servidor PHP

Este projeto foi migrado do Supabase para um servidor PHP personalizado hospedado na HostGator.

### Configuração da API

1. **URL Base**: Atualize a constante `API_BASE_URL` em `src/lib/api.ts` com o domínio da sua HostGator:
   ```typescript
   const API_BASE_URL = 'https://seudominio.com.br/api'
   ```

2. **Endpoints PHP Necessários**: Certifique-se de que os seguintes arquivos estão no diretório `/public_html/api/` da sua HostGator:
   - `login.php` - Endpoint de login
   - `register.php` - Endpoint de registro
   - `logout.php` - Endpoint de logout (opcional)
   - `verify-token.php` - Verificação de token
   - `profile.php` - Operações de perfil
   - `db.php` - Configuração do banco de dados

### Estrutura Esperada dos Endpoints PHP

#### login.php
```php
<?php
// Deve retornar:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@email.com",
      "name": "Nome do Usuário"
    },
    "token": "jwt_token_aqui"
  }
}
```

#### register.php
```php
<?php
// Deve retornar:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@email.com"
    },
    "token": "jwt_token_aqui"
  }
}
```

#### verify-token.php
```php
<?php
// Deve retornar:
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@email.com",
    "name": "Nome do Usuário"
  }
}
```

### Próximos Passos

Após configurar a autenticação, você precisará:

1. **Implementar endpoints para operações de perfil**
2. **Migrar sistema de swipes e matches**
3. **Implementar sistema de mensagens**
4. **Configurar upload de arquivos (avatares)**
5. **Implementar sistema de diamantes e transações**

### Funcionalidades Temporariamente Desabilitadas

- **Chat em tempo real**: Será necessário implementar WebSockets ou polling
- **Upload de avatares**: Precisa de endpoint PHP para upload
- **Todas as operações de banco de dados**: Precisam de endpoints PHP correspondentes

### Desenvolvimento

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Notas Importantes

- O arquivo `src/lib/supabase.ts` foi desabilitado mas mantido para compatibilidade
- Todas as importações do Supabase ainda existem no código mas não funcionarão
- É necessário implementar gradualmente cada funcionalidade no servidor PHP