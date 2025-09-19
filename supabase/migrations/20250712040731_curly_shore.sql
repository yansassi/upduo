/*
  # Add Premium Filter Preferences to Profiles

  1. New Columns
    - `min_age_filter` (integer) - Minimum age filter preference, default 18
    - `max_age_filter` (integer) - Maximum age filter preference, default 35
    - `selected_ranks_filter` (text[]) - Array of selected rank filters, default empty
    - `selected_states_filter` (text[]) - Array of selected state filters, default empty
    - `selected_cities_filter` (text[]) - Array of selected city filters, default empty
    - `selected_lanes_filter` (text[]) - Array of selected lane filters, default empty
    - `selected_heroes_filter` (text[]) - Array of selected hero filters, default empty
    - `compatibility_mode_filter` (boolean) - Compatibility mode preference, default true

  2. Changes
    - Add filter preference columns to profiles table with appropriate defaults
    - Ensure existing users get default values for new columns
*/

-- Add filter preference columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS min_age_filter integer DEFAULT 18,
ADD COLUMN IF NOT EXISTS max_age_filter integer DEFAULT 35,
ADD COLUMN IF NOT EXISTS selected_ranks_filter text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selected_states_filter text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selected_cities_filter text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selected_lanes_filter text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selected_heroes_filter text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compatibility_mode_filter boolean DEFAULT true;

-- Update existing profiles to have default filter values if they are null
UPDATE profiles 
SET 
  min_age_filter = COALESCE(min_age_filter, 18),
  max_age_filter = COALESCE(max_age_filter, 35),
  selected_ranks_filter = COALESCE(selected_ranks_filter, '{}'),
  selected_states_filter = COALESCE(selected_states_filter, '{}'),
  selected_cities_filter = COALESCE(selected_cities_filter, '{}'),
  selected_lanes_filter = COALESCE(selected_lanes_filter, '{}'),
  selected_heroes_filter = COALESCE(selected_heroes_filter, '{}'),
  compatibility_mode_filter = COALESCE(compatibility_mode_filter, true)
WHERE 
  min_age_filter IS NULL OR
  max_age_filter IS NULL OR
  selected_ranks_filter IS NULL OR
  selected_states_filter IS NULL OR
  selected_cities_filter IS NULL OR
  selected_lanes_filter IS NULL OR
  selected_heroes_filter IS NULL OR
  compatibility_mode_filter IS NULL;