/*
  # Criar tabela de denúncias

  1. Nova Tabela
    - `reports`
      - `id` (uuid, primary key)
      - `reporter_id` (uuid, foreign key para profiles)
      - `reported_id` (uuid, foreign key para profiles)
      - `match_id` (uuid, foreign key para matches)
      - `reason` (text, motivo da denúncia)
      - `comment` (text, comentário adicional)
      - `status` (text, status da denúncia)
      - `created_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela `reports`
    - Política para usuários autenticados inserirem denúncias
    - Política para usuários verem suas próprias denúncias

  3. Índices
    - Índices para melhorar performance das consultas
*/

-- Criar a tabela reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  reason text NOT NULL,
  comment text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Criar políticas de RLS
-- Usuários autenticados podem inserir denúncias
CREATE POLICY "Authenticated users can insert reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Usuários autenticados podem ver suas próprias denúncias
CREATE POLICY "Authenticated users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_id ON public.reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_match_id ON public.reports(match_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);