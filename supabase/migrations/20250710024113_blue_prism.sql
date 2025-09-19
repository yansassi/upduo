/*
  # Add messages table for chat functionality

  1. New Table
    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `message_text` (text, nullable) - Text content of message
      - `message_type` (text) - Type: 'text' or 'diamond'
      - `diamond_count` (integer, nullable) - Number of diamonds sent (only for diamond messages)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on messages table
    - Users can send messages to anyone
    - Users can only view messages they sent or received

  3. Performance
    - Add indexes for better query performance
*/

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text text,
  message_type text NOT NULL DEFAULT 'text',
  diamond_count integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Create policies
CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Add constraint to ensure diamond messages have diamond_count
ALTER TABLE messages ADD CONSTRAINT check_diamond_message 
  CHECK (
    (message_type = 'diamond' AND diamond_count > 0) OR 
    (message_type != 'diamond')
  );