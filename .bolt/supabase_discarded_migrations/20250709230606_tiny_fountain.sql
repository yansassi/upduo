/*
  # Add unread message tracking to matches table

  1. New Columns
    - `user1_last_read_message_id` (uuid) - Last message read by user1
    - `user2_last_read_message_id` (uuid) - Last message read by user2

  2. Security
    - Add policy for users to update their own last read message
    - Foreign key constraints to messages table

  3. Performance
    - Add indexes for better query performance
*/

-- Add columns to track last read messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'user1_last_read_message_id'
  ) THEN
    ALTER TABLE matches ADD COLUMN user1_last_read_message_id uuid REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'user2_last_read_message_id'
  ) THEN
    ALTER TABLE matches ADD COLUMN user2_last_read_message_id uuid REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add policy for users to update their last read message
CREATE POLICY "Users can update their last read message"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (
    (auth.uid() = user1_id AND user2_last_read_message_id IS NOT DISTINCT FROM OLD.user2_last_read_message_id) OR
    (auth.uid() = user2_id AND user1_last_read_message_id IS NOT DISTINCT FROM OLD.user1_last_read_message_id)
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_user1_last_read ON matches(user1_last_read_message_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_last_read ON matches(user2_last_read_message_id);