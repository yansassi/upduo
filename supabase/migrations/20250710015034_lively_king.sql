/*
  # Fix Daily Swipe System

  1. Ensure daily_swipe_counts table exists with correct structure
  2. Create simple increment function
  3. Set up proper policies

  This migration is safe to run multiple times.
*/

-- Create daily_swipe_counts table if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_swipe_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  swipe_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'daily_swipe_counts' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE daily_swipe_counts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own swipe counts" ON daily_swipe_counts;
DROP POLICY IF EXISTS "Users can insert their own swipe counts" ON daily_swipe_counts;
DROP POLICY IF EXISTS "Users can update their own swipe counts" ON daily_swipe_counts;

-- Create policies
CREATE POLICY "Users can view their own swipe counts"
  ON daily_swipe_counts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own swipe counts"
  ON daily_swipe_counts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own swipe counts"
  ON daily_swipe_counts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_swipe_counts_user_id ON daily_swipe_counts(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_swipe_counts_date ON daily_swipe_counts(date);
CREATE INDEX IF NOT EXISTS idx_daily_swipe_counts_user_date ON daily_swipe_counts(user_id, date);

-- Create or replace the increment function
CREATE OR REPLACE FUNCTION increment_daily_swipe_count(
  p_user_id uuid,
  p_date date
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  -- Insert or update the daily swipe count
  INSERT INTO daily_swipe_counts (user_id, date, swipe_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET 
    swipe_count = daily_swipe_counts.swipe_count + 1,
    updated_at = now()
  RETURNING swipe_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_daily_swipe_count(uuid, date) TO authenticated;

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_daily_swipe_counts_updated_at'
  ) THEN
    CREATE TRIGGER update_daily_swipe_counts_updated_at
      BEFORE UPDATE ON daily_swipe_counts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;