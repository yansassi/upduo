/*
  # Corrigir política duplicada na tabela premium_signups

  1. Problema
    - A política "Users can insert their own premium signup data" já existe
    - Tentativa de criar novamente está causando erro 42710

  2. Solução
    - Remover a política existente se ela existir
    - Recriar a política com a configuração correta
    - Garantir que não haja duplicatas

  3. Políticas da tabela premium_signups
    - INSERT: Usuários podem inserir seus próprios dados de signup premium
    - SELECT: Usuários podem visualizar seus próprios dados de signup premium
*/

-- Remove a política existente se ela existir (sem erro se não existir)
DROP POLICY IF EXISTS "Users can insert their own premium signup data" ON premium_signups;
DROP POLICY IF EXISTS "Users can view their own premium signup data" ON premium_signups;

-- Recria as políticas com a configuração correta
CREATE POLICY "Users can insert their own premium signup data"
  ON premium_signups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own premium signup data"
  ON premium_signups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);