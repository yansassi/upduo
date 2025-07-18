/*
  # Sistema de Notificações por Email

  1. Novas Tabelas
    - `email_notifications` - Log de emails enviados
    - `notification_preferences` - Preferências do usuário
    - `user_activity` - Tracking de atividade dos usuários

  2. Triggers
    - Trigger para detectar novos matches
    - Trigger para detectar novas mensagens
    - Trigger para atualizar última atividade

  3. Funções
    - Função para enviar notificações
    - Função para detectar usuários inativos
*/

-- Tabela para log de notificações enviadas
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_type text NOT NULL CHECK (email_type IN ('new_message', 'new_match', 'inactive_user', 'welcome', 'premium_expired')),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  template_data jsonb DEFAULT '{}',
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Tabela para preferências de notificação
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_new_messages boolean DEFAULT true,
  email_new_matches boolean DEFAULT true,
  email_inactive_reminders boolean DEFAULT true,
  email_marketing boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela para tracking de atividade
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  last_login timestamptz DEFAULT now(),
  last_swipe timestamptz,
  last_message timestamptz,
  last_profile_update timestamptz,
  total_logins integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(email_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON email_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_login ON user_activity(last_login);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);

-- RLS
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own email notifications"
  ON email_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity"
  ON user_activity
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage all notification data"
  ON email_notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can manage all activity data"
  ON user_activity
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

CREATE TRIGGER update_user_activity_updated_at
  BEFORE UPDATE ON user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity_updated_at();

-- Função para criar preferências padrão quando um perfil é criado
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO user_activity (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar preferências padrão
CREATE TRIGGER create_default_notification_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Função para detectar novos matches e enviar notificação
CREATE OR REPLACE FUNCTION notify_new_match()
RETURNS TRIGGER AS $$
DECLARE
  user1_email text;
  user2_email text;
  user1_name text;
  user2_name text;
  user1_prefs boolean;
  user2_prefs boolean;
BEGIN
  -- Buscar dados dos usuários
  SELECT p.email, p.name, COALESCE(np.email_new_matches, true)
  INTO user1_email, user1_name, user1_prefs
  FROM profiles p
  LEFT JOIN notification_preferences np ON p.id = np.user_id
  WHERE p.id = NEW.user1_id;
  
  SELECT p.email, p.name, COALESCE(np.email_new_matches, true)
  INTO user2_email, user2_name, user2_prefs
  FROM profiles p
  LEFT JOIN notification_preferences np ON p.id = np.user_id
  WHERE p.id = NEW.user2_id;
  
  -- Enviar notificação para user1 se ele quer receber
  IF user1_prefs THEN
    INSERT INTO email_notifications (user_id, email_type, recipient_email, subject, template_data, status)
    VALUES (
      NEW.user1_id,
      'new_match',
      user1_email,
      '💕 Você tem um novo match no UpDuo!',
      jsonb_build_object(
        'user_name', user1_name,
        'match_name', user2_name,
        'match_id', NEW.id
      ),
      'pending'
    );
  END IF;
  
  -- Enviar notificação para user2 se ele quer receber
  IF user2_prefs THEN
    INSERT INTO email_notifications (user_id, email_type, recipient_email, subject, template_data, status)
    VALUES (
      NEW.user2_id,
      'new_match',
      user2_email,
      '💕 Você tem um novo match no UpDuo!',
      jsonb_build_object(
        'user_name', user2_name,
        'match_name', user1_name,
        'match_id', NEW.id
      ),
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para novos matches
CREATE TRIGGER notify_new_match_trigger
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_match();

-- Função para detectar novas mensagens e enviar notificação
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  receiver_email text;
  receiver_name text;
  sender_name text;
  receiver_prefs boolean;
  match_exists boolean;
BEGIN
  -- Verificar se existe um match entre os usuários
  SELECT EXISTS(
    SELECT 1 FROM matches 
    WHERE (user1_id = NEW.sender_id AND user2_id = NEW.receiver_id)
       OR (user1_id = NEW.receiver_id AND user2_id = NEW.sender_id)
  ) INTO match_exists;
  
  -- Só enviar notificação se existe um match
  IF NOT match_exists THEN
    RETURN NEW;
  END IF;
  
  -- Buscar dados do receptor
  SELECT p.email, p.name, COALESCE(np.email_new_messages, true)
  INTO receiver_email, receiver_name, receiver_prefs
  FROM profiles p
  LEFT JOIN notification_preferences np ON p.id = np.user_id
  WHERE p.id = NEW.receiver_id;
  
  -- Buscar nome do remetente
  SELECT name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Enviar notificação se o receptor quer receber
  IF receiver_prefs THEN
    INSERT INTO email_notifications (user_id, email_type, recipient_email, subject, template_data, status)
    VALUES (
      NEW.receiver_id,
      'new_message',
      receiver_email,
      '💬 Nova mensagem no UpDuo!',
      jsonb_build_object(
        'receiver_name', receiver_name,
        'sender_name', sender_name,
        'message_preview', CASE 
          WHEN NEW.message_type = 'diamond' THEN 'Enviou diamantes para você!'
          ELSE LEFT(NEW.message_text, 50) || CASE WHEN LENGTH(NEW.message_text) > 50 THEN '...' ELSE '' END
        END,
        'sender_id', NEW.sender_id
      ),
      'pending'
    );
  END IF;
  
  -- Atualizar atividade do remetente
  INSERT INTO user_activity (user_id, last_message)
  VALUES (NEW.sender_id, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    last_message = now(),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para novas mensagens
CREATE TRIGGER notify_new_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Função para atualizar atividade em swipes
CREATE OR REPLACE FUNCTION update_swipe_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity (user_id, last_swipe)
  VALUES (NEW.swiper_id, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    last_swipe = now(),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para swipes
CREATE TRIGGER update_swipe_activity_trigger
  AFTER INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION update_swipe_activity();

-- Função para encontrar usuários inativos
CREATE OR REPLACE FUNCTION find_inactive_users(days_inactive integer DEFAULT 7)
RETURNS TABLE(
  user_id uuid,
  email text,
  name text,
  last_activity timestamptz,
  days_since_activity integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.name,
    GREATEST(
      ua.last_login,
      COALESCE(ua.last_swipe, '1970-01-01'::timestamptz),
      COALESCE(ua.last_message, '1970-01-01'::timestamptz),
      COALESCE(ua.last_profile_update, '1970-01-01'::timestamptz)
    ) as last_activity,
    EXTRACT(days FROM now() - GREATEST(
      ua.last_login,
      COALESCE(ua.last_swipe, '1970-01-01'::timestamptz),
      COALESCE(ua.last_message, '1970-01-01'::timestamptz),
      COALESCE(ua.last_profile_update, '1970-01-01'::timestamptz)
    ))::integer as days_since_activity
  FROM profiles p
  JOIN user_activity ua ON p.id = ua.user_id
  LEFT JOIN notification_preferences np ON p.id = np.user_id
  WHERE 
    GREATEST(
      ua.last_login,
      COALESCE(ua.last_swipe, '1970-01-01'::timestamptz),
      COALESCE(ua.last_message, '1970-01-01'::timestamptz),
      COALESCE(ua.last_profile_update, '1970-01-01'::timestamptz)
    ) < now() - interval '1 day' * days_inactive
    AND COALESCE(np.email_inactive_reminders, true) = true
    -- Não enviar se já enviou um email de inatividade nos últimos 3 dias
    AND NOT EXISTS (
      SELECT 1 FROM email_notifications en
      WHERE en.user_id = p.id 
        AND en.email_type = 'inactive_user'
        AND en.sent_at > now() - interval '3 days'
    );
END;
$$ LANGUAGE plpgsql;