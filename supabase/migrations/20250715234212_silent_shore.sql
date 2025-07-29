/*
  # Fix duplicate policy error for premium_signups table

  1. Changes
    - Drop existing policies if they exist before creating new ones
    - Use IF EXISTS to prevent errors when policies don't exist
    - Recreate policies with proper permissions

  2. Security
    - Maintain same security model
    - Users can only insert and view their own premium signup data
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own premium signup data" ON premium_signups;
DROP POLICY IF EXISTS "Users can view their own premium signup data" ON premium_signups;

-- Recreate the policies
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