/*
  # Add function to increment daily swipe count

  1. Function
    - `increment_daily_swipe_count` - Safely increment or create daily swipe count
    - Uses upsert logic to handle both new and existing records
    - Returns the new swipe count

  2. Security
    - Function runs with definer rights for proper RLS handling
    - Only authenticated users can call this function
*/

-- Create function to increment daily swipe count
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