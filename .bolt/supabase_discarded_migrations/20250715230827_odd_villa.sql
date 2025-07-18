/*
  # Create diamond purchase intents table

  1. New Tables
    - `diamond_purchase_intents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text, user's full name)
      - `email` (text, user's email)
      - `phone` (text, user's phone number)
      - `diamond_package_id` (text, foreign key to diamond_packages)
      - `amount_paid` (numeric, price paid for the package)
      - `status` (text, purchase status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `diamond_purchase_intents` table
    - Add policies for users to insert and view their own purchase intents
*/

CREATE TABLE IF NOT EXISTS diamond_purchase_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  diamond_package_id text NOT NULL REFERENCES diamond_packages(id),
  amount_paid numeric NOT NULL CHECK (amount_paid > 0),
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'redirected', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE diamond_purchase_intents ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_diamond_purchase_intents_user_id ON diamond_purchase_intents(user_id);
CREATE INDEX idx_diamond_purchase_intents_created_at ON diamond_purchase_intents(created_at);
CREATE INDEX idx_diamond_purchase_intents_status ON diamond_purchase_intents(status);

-- RLS Policies
CREATE POLICY "Users can insert their own diamond purchase intents"
  ON diamond_purchase_intents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own diamond purchase intents"
  ON diamond_purchase_intents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);