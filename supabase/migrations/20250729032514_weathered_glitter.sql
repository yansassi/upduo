/*
  # Adicionar coluna para armazenar código de indicação digitado

  1. Alterações na tabela
    - Adiciona coluna `entered_referral_code_text` na tabela `profiles`
    - Permite armazenar o código de indicação exato que o usuário digitou
    - Não requer validação ou referência a usuário existente

  2. Detalhes
    - Tipo: TEXT (permite qualquer string)
    - Nullable: SIM (campo opcional)
    - Sem constraints de chave estrangeira
*/

-- Adicionar nova coluna para armazenar o código de indicação digitado pelo usuário
ALTER TABLE public.profiles
ADD COLUMN entered_referral_code_text TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.profiles.entered_referral_code_text IS 'Código de indicação digitado pelo usuário durante o cadastro (sem validação)';