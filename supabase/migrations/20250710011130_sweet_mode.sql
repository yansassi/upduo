/*
  # Add Premium User Support

  1. New Columns
    - `is_premium` (boolean) - Indicates if user has premium subscription
    - Default value is false for all existing and new users

  2. Security
    - Users can view premium status of other users (for displaying verified badge)
    - Only users can update their own premium status (for future subscription management)

  3. Performance
    - Add index on is_premium for efficient filtering if needed
*/

-- Add is_premium column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_premium boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add index for better performance when filtering by premium status
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);

-- Update existing policies to include is_premium in selectable columns
-- (The existing "Users can view other profiles for matching" policy already covers this)

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_premium IS 'Indicates whether the user has an active premium subscription';