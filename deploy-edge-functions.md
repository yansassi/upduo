# Como configurar as variáveis de ambiente para Edge Functions

## Passo 1: Configurar variáveis no painel do Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard/projects/dleovjfidkqozocszllj
2. No menu lateral, clique em "Edge Functions"
3. Clique na função `create-abacatepay-pix`
4. Vá para a aba "Settings"
5. Na seção "Environment Variables", adicione as seguintes variáveis:

### Variáveis obrigatórias:

- **Nome**: `ABACATEPAY_API_KEY`
  **Valor**: `abc_dev_qg5dZU53CKX5uh5ckfbGJ15H`

- **Nome**: `ABACATEPAY_API_URL`
  **Valor**: `https://api.abacatepay.com/v1`

- **Nome**: `SUPABASE_URL`
  **Valor**: `https://dleovjfidkqozocszllj.supabase.co`

- **Nome**: `SUPABASE_SERVICE_ROLE_KEY`
  **Valor**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZW92amZpZGtxb3pvY3N6bGxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA3OTc5MywiZXhwIjoyMDY3NjU1NzkzfQ.8LiU3H0slrbpTCeD9bOsjLSdtXPqAu8CNO2yQgOMqw8`

## Passo 2: Redeployar a função

1. Após adicionar todas as variáveis, clique em "Deploy" ou "Redeploy"
2. Aguarde o deploy ser concluído

## Passo 3: Repetir para outras Edge Functions

Repita o processo para as outras Edge Functions:
- `abacatepay-webhook`
- `check-payment-status`

## Passo 4: Testar

1. Tente assinar o premium novamente no aplicativo
2. Se ainda houver erro, verifique os logs da Edge Function para mais detalhes

## Comandos CLI (alternativo)

Se você preferir usar o CLI do Supabase:

```bash
# Definir variáveis de ambiente
supabase secrets set ABACATEPAY_API_KEY=abc_dev_qg5dZU53CKX5uh5ckfbGJ15H
supabase secrets set ABACATEPAY_API_URL=https://api.abacatepay.com/v1
supabase secrets set SUPABASE_URL=https://dleovjfidkqozocszllj.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZW92amZpZGtxb3pvY3N6bGxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA3OTc5MywiZXhwIjoyMDY3NjU1NzkzfQ.8LiU3H0slrbpTCeD9bOsjLSdtXPqAu8CNO2yQgOMqw8

# Redeployar as funções
supabase functions deploy create-abacatepay-pix
supabase functions deploy abacatepay-webhook
supabase functions deploy check-payment-status
```