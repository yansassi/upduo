/*
  # Create premium signups table

  1. New Tables
    - `premium_signups`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text, not null)
      - `email` (text, not null)
      - `phone` (text, not null)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `premium_signups` table
    - Add policy for users to insert their own signup data
    - Add policy for users to view their own signup data

  3. Indexes
    - Add index on user_id for better query performance
    - Add index on created_at for sorting
*/

-- Create the premium_signups table
CREATE TABLE IF NOT EXISTS premium_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE premium_signups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own premium signup data"
  ON premium_signups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own premium signup data"
  ON premium_signups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_premium_signups_user_id ON premium_signups(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_signups_created_at ON premium_signups(created_at);