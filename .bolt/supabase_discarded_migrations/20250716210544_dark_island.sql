/*
  # Sistema de Tarefas Diárias

  1. Nova Tabela
    - `daily_tasks` - Define as tarefas disponíveis
    - `user_daily_tasks` - Progresso das tarefas por usuário

  2. Funcionalidades
    - Tarefas diárias que resetam todo dia
    - Sistema de progresso e recompensas
    - Coleta de diamantes por tarefa completada

  3. Tarefas Implementadas
    - Login diário (2 diamantes)
    - 20 swipes por dia (5 diamantes)  
    - 2 matches por dia (3 diamantes)
*/

-- Tabela de tarefas disponíveis
CREATE TABLE IF NOT EXISTS daily_tasks (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  target_value integer NOT NULL,
  reward_diamonds integer NOT NULL,
  task_type text NOT NULL CHECK (task_type IN ('login', 'swipes', 'matches')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de progresso das tarefas por usuário
CREATE TABLE IF NOT EXISTS user_daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id text NOT NULL REFERENCES daily_tasks(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  current_progress integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  is_collected boolean DEFAULT false,
  completed_at timestamptz,
  collected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_user_date ON user_daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_task_date ON user_daily_tasks(task_id, date);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_completed ON user_daily_tasks(is_completed, is_collected);

-- RLS
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas para daily_tasks (leitura pública)
CREATE POLICY "Public can read daily tasks"
  ON daily_tasks
  FOR SELECT
  TO public
  USING (is_active = true);

-- Políticas para user_daily_tasks
CREATE POLICY "Users can view their own task progress"
  ON user_daily_tasks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own task progress"
  ON user_daily_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own task progress"
  ON user_daily_tasks
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Inserir as tarefas padrão
INSERT INTO daily_tasks (id, name, description, target_value, reward_diamonds, task_type) VALUES
  ('daily_login', 'Login Diário', 'Faça login no aplicativo', 1, 2, 'login'),
  ('daily_swipes', 'Dar 20 Swipes', 'Avalie 20 perfis hoje', 20, 5, 'swipes'),
  ('daily_matches', 'Conseguir 2 Matches', 'Consiga 2 matches hoje', 2, 3, 'matches')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_value = EXCLUDED.target_value,
  reward_diamonds = EXCLUDED.reward_diamonds,
  task_type = EXCLUDED.task_type;

-- Função para atualizar progresso de tarefa
CREATE OR REPLACE FUNCTION update_task_progress(
  p_user_id uuid,
  p_task_id text,
  p_increment integer DEFAULT 1
) RETURNS boolean AS $$
DECLARE
  v_task_target integer;
  v_current_progress integer;
  v_new_progress integer;
BEGIN
  -- Buscar target da tarefa
  SELECT target_value INTO v_task_target
  FROM daily_tasks
  WHERE id = p_task_id AND is_active = true;
  
  IF v_task_target IS NULL THEN
    RETURN false;
  END IF;
  
  -- Inserir ou atualizar progresso
  INSERT INTO user_daily_tasks (user_id, task_id, current_progress, updated_at)
  VALUES (p_user_id, p_task_id, p_increment, now())
  ON CONFLICT (user_id, task_id, date)
  DO UPDATE SET
    current_progress = LEAST(user_daily_tasks.current_progress + p_increment, v_task_target),
    updated_at = now()
  RETURNING current_progress INTO v_new_progress;
  
  -- Marcar como completada se atingiu o target
  IF v_new_progress >= v_task_target THEN
    UPDATE user_daily_tasks
    SET is_completed = true, completed_at = now()
    WHERE user_id = p_user_id AND task_id = p_task_id AND date = CURRENT_DATE
      AND is_completed = false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para coletar recompensa de tarefa
CREATE OR REPLACE FUNCTION collect_task_reward(
  p_user_id uuid,
  p_task_id text
) RETURNS json AS $$
DECLARE
  v_reward_diamonds integer;
  v_task_progress record;
  v_current_diamonds integer;
BEGIN
  -- Verificar se a tarefa está completada e não foi coletada
  SELECT * INTO v_task_progress
  FROM user_daily_tasks
  WHERE user_id = p_user_id 
    AND task_id = p_task_id 
    AND date = CURRENT_DATE
    AND is_completed = true 
    AND is_collected = false;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Tarefa não completada ou já coletada'
    );
  END IF;
  
  -- Buscar recompensa da tarefa
  SELECT reward_diamonds INTO v_reward_diamonds
  FROM daily_tasks
  WHERE id = p_task_id AND is_active = true;
  
  IF v_reward_diamonds IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Tarefa não encontrada'
    );
  END IF;
  
  -- Marcar como coletada
  UPDATE user_daily_tasks
  SET is_collected = true, collected_at = now()
  WHERE user_id = p_user_id AND task_id = p_task_id AND date = CURRENT_DATE;
  
  -- Adicionar diamantes ao usuário
  UPDATE profiles
  SET diamond_count = diamond_count + v_reward_diamonds
  WHERE id = p_user_id
  RETURNING diamond_count INTO v_current_diamonds;
  
  RETURN json_build_object(
    'success', true,
    'diamonds_earned', v_reward_diamonds,
    'total_diamonds', v_current_diamonds
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar progresso de login
CREATE OR REPLACE FUNCTION update_login_task_progress()
RETURNS trigger AS $$
BEGIN
  -- Atualizar progresso da tarefa de login diário
  PERFORM update_task_progress(NEW.user_id, 'daily_login', 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar progresso de matches
CREATE OR REPLACE FUNCTION update_match_task_progress()
RETURNS trigger AS $$
BEGIN
  -- Atualizar progresso da tarefa de matches para ambos usuários
  PERFORM update_task_progress(NEW.user1_id, 'daily_matches', 1);
  PERFORM update_task_progress(NEW.user2_id, 'daily_matches', 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_login_task_trigger ON user_activity;
CREATE TRIGGER update_login_task_trigger
  AFTER INSERT OR UPDATE OF last_login ON user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_login_task_progress();

DROP TRIGGER IF EXISTS update_match_task_trigger ON matches;
CREATE TRIGGER update_match_task_trigger
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_match_task_progress();

-- Função para atualizar progresso de swipes (será chamada manualmente)
CREATE OR REPLACE FUNCTION update_swipe_task_progress(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN update_task_progress(p_user_id, 'daily_swipes', 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_user_daily_tasks_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_daily_tasks_updated_at_trigger ON user_daily_tasks;
CREATE TRIGGER update_user_daily_tasks_updated_at_trigger
  BEFORE UPDATE ON user_daily_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_daily_tasks_updated_at();