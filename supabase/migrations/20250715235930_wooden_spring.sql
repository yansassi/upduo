/*
  # Corrigir índice duplicado na tabela diamond_purchase_intents

  1. Problema
    - Índice "idx_diamond_purchase_intents_user_id" já existe
    - Erro 42P07 indica relação duplicada

  2. Solução
    - Remover índices existentes se existirem
    - Recriar índices com configuração correta
    - Usar IF EXISTS para evitar erros futuros

  3. Índices recriados
    - idx_diamond_purchase_intents_user_id
    - idx_diamond_purchase_intents_status  
    - idx_diamond_purchase_intents_created_at
*/

-- Remove índices existentes se existirem
DROP INDEX IF EXISTS idx_diamond_purchase_intents_user_id;
DROP INDEX IF EXISTS idx_diamond_purchase_intents_status;
DROP INDEX IF EXISTS idx_diamond_purchase_intents_created_at;

-- Recria os índices necessários
CREATE INDEX IF NOT EXISTS idx_diamond_purchase_intents_user_id 
ON diamond_purchase_intents(user_id);

CREATE INDEX IF NOT EXISTS idx_diamond_purchase_intents_status 
ON diamond_purchase_intents(status);

CREATE INDEX IF NOT EXISTS idx_diamond_purchase_intents_created_at 
ON diamond_purchase_intents(created_at);