/*
  # Evento de Inauguração - Sistema de Sorteios

  1. New Tables
    - `inauguration_participants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `participated_at` (timestamp)
      - `ip_address` (text, for security)
    - `daily_winners`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `draw_date` (date)
      - `prize_amount` (integer, default 30)
      - `awarded_at` (timestamp)
      - `instagram_posted` (boolean, default false)

  2. Security
    - Enable RLS on both tables
    - Add policies for participants and winners
    - Add unique constraint to prevent multiple participations per user

  3. Indexes
    - Add indexes for performance on common queries
*/

-- Create inauguration_participants table
CREATE TABLE IF NOT EXISTS inauguration_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participated_at timestamptz DEFAULT now(),
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create daily_winners table
CREATE TABLE IF NOT EXISTS daily_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  draw_date date NOT NULL,
  prize_amount integer DEFAULT 30,
  awarded_at timestamptz DEFAULT now(),
  instagram_posted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint to prevent multiple participations per user
ALTER TABLE inauguration_participants 
ADD CONSTRAINT unique_user_participation 
UNIQUE (user_id);

-- Add unique constraint to prevent multiple wins per day
ALTER TABLE daily_winners 
ADD CONSTRAINT unique_daily_winner 
UNIQUE (draw_date);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inauguration_participants_user_id 
ON inauguration_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_inauguration_participants_participated_at 
ON inauguration_participants(participated_at);

CREATE INDEX IF NOT EXISTS idx_daily_winners_draw_date 
ON daily_winners(draw_date);

CREATE INDEX IF NOT EXISTS idx_daily_winners_user_id 
ON daily_winners(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_winners_awarded_at 
ON daily_winners(awarded_at);

-- Enable RLS
ALTER TABLE inauguration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inauguration_participants
CREATE POLICY "Users can insert their own participation"
  ON inauguration_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own participation"
  ON inauguration_participants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view participation count"
  ON inauguration_participants
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for daily_winners
CREATE POLICY "Public can view winners"
  ON daily_winners
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can insert winners"
  ON daily_winners
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update winners"
  ON daily_winners
  FOR UPDATE
  TO authenticated
  USING (true);

-- Function to get random participant for daily draw
CREATE OR REPLACE FUNCTION get_random_participant_for_draw()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  random_user_id uuid;
BEGIN
  -- Get a random participant who hasn't won yet
  SELECT user_id INTO random_user_id
  FROM inauguration_participants ip
  WHERE NOT EXISTS (
    SELECT 1 FROM daily_winners dw 
    WHERE dw.user_id = ip.user_id
  )
  ORDER BY RANDOM()
  LIMIT 1;
  
  RETURN random_user_id;
END;
$$;

-- Function to award daily prize
CREATE OR REPLACE FUNCTION award_daily_prize(p_draw_date date DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  winner_user_id uuid;
  winner_profile record;
  result json;
BEGIN
  -- Check if there's already a winner for this date
  IF EXISTS (SELECT 1 FROM daily_winners WHERE draw_date = p_draw_date) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Winner already selected for this date'
    );
  END IF;
  
  -- Get random participant
  SELECT get_random_participant_for_draw() INTO winner_user_id;
  
  IF winner_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No eligible participants found'
    );
  END IF;
  
  -- Get winner profile info
  SELECT * INTO winner_profile
  FROM profiles
  WHERE id = winner_user_id;
  
  -- Insert winner record
  INSERT INTO daily_winners (user_id, draw_date, prize_amount)
  VALUES (winner_user_id, p_draw_date, 30);
  
  -- Award diamonds to winner
  UPDATE profiles
  SET diamond_count = diamond_count + 30,
      updated_at = now()
  WHERE id = winner_user_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    sender_id,
    receiver_id,
    amount,
    transaction_type,
    status
  ) VALUES (
    winner_user_id, -- Using same ID for system transactions
    winner_user_id,
    30,
    'inauguration_prize',
    'completed'
  );
  
  RETURN json_build_object(
    'success', true,
    'winner_id', winner_user_id,
    'winner_name', winner_profile.name,
    'winner_email', winner_profile.email,
    'prize_amount', 30,
    'draw_date', p_draw_date
  );
END;
$$;