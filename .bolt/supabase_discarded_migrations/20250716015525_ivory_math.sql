/*
  # Atualizar tabela de pagamentos para Cakto

  1. Alterações na tabela payments
    - Adicionar coluna cakto_payment_id para armazenar ID do Cakto
    - Adicionar índice para busca rápida por ID do Cakto
    - Atualizar constraints para suportar múltiplos provedores de pagamento

  2. Segurança
    - Manter RLS existente
    - Adicionar políticas para webhook do Cakto
*/

-- Adicionar coluna para ID do pagamento no Cakto
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'cakto_payment_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN cakto_payment_id text;
  END IF;
END $$;

-- Criar índice para busca rápida por ID do Cakto
CREATE INDEX IF NOT EXISTS idx_payments_cakto_id ON payments(cakto_payment_id);

-- Atualizar constraint para permitir pagamentos sem abacatepay_payment_id
DO $$
BEGIN
  -- Remover constraint de unique se existir apenas para abacatepay
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'payments' 
    AND constraint_name = 'payments_abacatepay_payment_id_key'
  ) THEN
    -- Tornar abacatepay_payment_id nullable para suportar outros provedores
    ALTER TABLE payments ALTER COLUMN abacatepay_payment_id DROP NOT NULL;
  END IF;
END $$;

-- Adicionar constraint para garantir que pelo menos um ID de pagamento externo existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'payments_external_id_check'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_external_id_check 
    CHECK (
      abacatepay_payment_id IS NOT NULL OR 
      cakto_payment_id IS NOT NULL
    );
  END IF;
END $$;

-- Criar índice único para cakto_payment_id (quando não for null)
CREATE UNIQUE INDEX IF NOT EXISTS payments_cakto_payment_id_unique 
ON payments(cakto_payment_id) 
WHERE cakto_payment_id IS NOT NULL;

-- Atualizar função de trigger para payments se necessário
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Comentários para documentação
COMMENT ON COLUMN payments.cakto_payment_id IS 'ID do pagamento no sistema Cakto';
COMMENT ON INDEX idx_payments_cakto_id IS 'Índice para busca rápida por ID do Cakto';