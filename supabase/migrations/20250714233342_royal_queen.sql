-- Script SQL para configurar variáveis de ambiente das Edge Functions
-- Execute este script no SQL Editor do Supabase

-- Nota: As variáveis de ambiente das Edge Functions não podem ser configuradas via SQL
-- Elas devem ser configuradas através do painel do Supabase ou CLI
-- Este script serve como referência dos valores que devem ser configurados

-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/projects/dleovjfidkqozocszllj/functions
-- 2. Para cada função (create-abacatepay-pix, abacatepay-webhook, check-payment-status):
--    - Clique na função
--    - Vá para aba "Settings"
--    - Adicione as variáveis abaixo na seção "Environment Variables"
--    - Clique em "Deploy" para aplicar

-- VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
-- 
-- ABACATEPAY_API_KEY = abc_dev_qg5dZU53CKX5uh5ckfbGJ15H
-- ABACATEPAY_API_URL = https://api.abacatepay.com/v1
-- SUPABASE_URL = https://dleovjfidkqozocszllj.supabase.co
-- SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZW92amZpZGtxb3pvY3N6bGxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA3OTc5MywiZXhwIjoyMDY3NjU1NzkzfQ.8LiU3H0slrbpTCeD9bOsjLSdtXPqAu8CNO2yQgOMqw8

-- Verificar se as tabelas necessárias existem e estão configuradas corretamente
SELECT 'Verificando estrutura das tabelas...' as status;

-- Verificar tabela payments
SELECT 
    'payments' as tabela,
    count(*) as total_registros
FROM payments;

-- Verificar tabela profiles
SELECT 
    'profiles' as tabela,
    count(*) as total_registros,
    count(*) FILTER (WHERE is_premium = true) as usuarios_premium
FROM profiles;

-- Verificar se as políticas RLS estão ativas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_ativo
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('payments', 'profiles', 'transactions');

-- Verificar se as Edge Functions estão deployadas (esta query pode não retornar resultados)
-- As Edge Functions são gerenciadas fora do banco de dados
SELECT 'Edge Functions devem ser configuradas no painel do Supabase' as importante;

-- Script para testar se um usuário pode ser atualizado para premium (exemplo)
-- SUBSTITUA 'USER_ID_AQUI' pelo ID real de um usuário para teste
/*
UPDATE profiles 
SET is_premium = true, updated_at = now()
WHERE id = 'USER_ID_AQUI';

SELECT id, name, is_premium, updated_at 
FROM profiles 
WHERE id = 'USER_ID_AQUI';
*/

SELECT 'Configuração concluída! Agora configure as variáveis de ambiente no painel do Supabase.' as resultado;