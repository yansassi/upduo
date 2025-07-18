/*
  # Adicionar campo de país aos perfis

  1. Alterações na tabela
    - Adiciona coluna `country` à tabela `profiles`
    - Define valor padrão como 'BR' (Brasil)
    - Adiciona índice para consultas por país

  2. Segurança
    - Mantém as políticas RLS existentes
    - O campo país é editável pelo próprio usuário
*/

-- Adicionar coluna country à tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text DEFAULT 'BR' NOT NULL;

-- Adicionar comentário à coluna
COMMENT ON COLUMN profiles.country IS 'Código do país do usuário (ISO 3166-1 alpha-2)';

-- Criar índice para consultas por país
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- Atualizar usuários existentes para Brasil como padrão
UPDATE profiles SET country = 'BR' WHERE country IS NULL;