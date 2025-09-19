/*
  # Add read message tracking to matches table

  1. Changes
    - Add `user1_last_read_message_id` column to `matches` table
    - Add `user2_last_read_message_id` column to `matches` table
    - Both columns are nullable UUIDs that reference messages

  2. Purpose
    - Track which message each user has read last in a conversation
    - Enable unread message indicators and read receipts
    - Improve user experience by showing conversation status
*/

-- Add read message tracking columns to matches table
DO $$
BEGIN
  -- Add user1_last_read_message_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'user1_last_read_message_id'
  ) THEN
    ALTER TABLE matches ADD COLUMN user1_last_read_message_id uuid;
  END IF;

  -- Add user2_last_read_message_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'user2_last_read_message_id'
  ) THEN
    ALTER TABLE matches ADD COLUMN user2_last_read_message_id uuid;
  END IF;
END $$;

-- Add foreign key constraints to ensure referential integrity
DO $$
BEGIN
  -- Add foreign key for user1_last_read_message_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'matches_user1_last_read_message_id_fkey'
  ) THEN
    ALTER TABLE matches 
    ADD CONSTRAINT matches_user1_last_read_message_id_fkey 
    FOREIGN KEY (user1_last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key for user2_last_read_message_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'matches_user2_last_read_message_id_fkey'
  ) THEN
    ALTER TABLE matches 
    ADD CONSTRAINT matches_user2_last_read_message_id_fkey 
    FOREIGN KEY (user2_last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;