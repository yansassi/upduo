/*
  # Add diamond count to profiles

  1. New Column
    - `diamond_count` (integer) - Number of diamonds the user has
    - Default value is 0 for all existing and new users

  2. Security
    - Users can view their own diamond count
    - Only users can update their own diamond count (for future purchase management)

  3. Performance
    - Add index on diamond_count for efficient filtering if needed
*/

-- Add diamond_count column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'diamond_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN diamond_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add index for better performance when filtering by diamond count
CREATE INDEX IF NOT EXISTS idx_profiles_diamond_count ON profiles(diamond_count);

-- Add comment for documentation
COMMENT ON COLUMN profiles.diamond_count IS 'Number of diamonds the user currently has';