/*
  # Add daily swipe limits tracking

  1. New Table
    - `daily_swipe_counts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `date` (date) - The date for tracking
      - `swipe_count` (integer) - Number of swipes performed on this date
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on daily_swipe_counts table
    - Users can only view and update their own swipe counts

  3. Performance
    - Add unique constraint on user_id and date
    - Add indexes for better query performance
*/

-- Create daily_swipe_counts table
CREATE TABLE IF NOT EXISTS daily_swipe_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  swipe_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE daily_swipe_counts ENABLE ROW LEVEL SECURITY;

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

-- Create trigger for updated_at
CREATE TRIGGER update_daily_swipe_counts_updated_at
  BEFORE UPDATE ON daily_swipe_counts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();