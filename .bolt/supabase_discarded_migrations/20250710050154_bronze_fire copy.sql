/*
  # Criar tabela de transações de diamantes

  1. Nova Tabela
    - `transactions`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key para profiles)
      - `receiver_id` (uuid, foreign key para profiles)
      - `amount` (integer, quantidade de diamantes)
      - `transaction_type` (text, tipo da transação)
      - `status` (text, status da transação)
      - `created_at` (timestamp)
      - `related_message_id` (uuid, foreign key para messages)
      - `error_message` (text, detalhes do erro se houver)

  2. Segurança
    - Habilitar RLS na tabela `transactions`
    - Adicionar políticas para usuários verem suas próprias transações
    - Adicionar política para usuários criarem suas próprias transações

  3. Índices
    - Índices para melhorar performance de consultas
*/

-- Criar a tabela transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  transaction_type text NOT NULL DEFAULT 'diamond_transfer',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  related_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  error_message text
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas de RLS
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = sender_id);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_transactions_sender_id ON public.transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_id ON public.transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();