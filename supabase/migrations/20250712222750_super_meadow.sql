/*
  # Sistema de Saque de Diamantes

  1. Nova tabela para registrar saques
    - `diamond_withdrawals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para profiles)
      - `amount` (integer, quantidade de diamantes)
      - `ml_user_id` (text, ID do usuário no Mobile Legends)
      - `ml_zone_id` (text, ID da zona no Mobile Legends)
      - `status` (text, status do saque: pending, approved, completed, rejected)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `processed_at` (timestamp, quando foi processado)

  2. Adicionar campos ao perfil do usuário
    - `ml_user_id` (text, ID padrão do usuário no ML)
    - `ml_zone_id` (text, ID padrão da zona no ML)

  3. Segurança
    - RLS habilitado
    - Políticas para usuários autenticados
*/

-- Adicionar campos ML ao perfil do usuário
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ml_user_id text,
ADD COLUMN IF NOT EXISTS ml_zone_id text;

-- Criar tabela de saques de diamantes
CREATE TABLE IF NOT EXISTS diamond_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  ml_user_id text NOT NULL,
  ml_zone_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  notes text
);

-- Habilitar RLS
ALTER TABLE diamond_withdrawals ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own withdrawals"
  ON diamond_withdrawals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals"
  ON diamond_withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_diamond_withdrawals_user_id ON diamond_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_diamond_withdrawals_status ON diamond_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_diamond_withdrawals_created_at ON diamond_withdrawals(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_diamond_withdrawals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_diamond_withdrawals_updated_at
  BEFORE UPDATE ON diamond_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_diamond_withdrawals_updated_at();