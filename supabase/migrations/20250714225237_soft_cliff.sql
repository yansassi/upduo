/*
  # Add missing columns to profiles table

  1. Changes
    - Add `is_premium` column (boolean, default false) if it doesn't exist
    - Add `diamond_count` column (integer, default 0) if it doesn't exist
    - Add `ml_user_id` column (text) if it doesn't exist
    - Add `ml_zone_id` column (text) if it doesn't exist
    - Add filter columns if they don't exist

  2. Security
    - No changes to existing RLS policies
*/

-- Add is_premium column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_premium boolean DEFAULT false NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles USING btree (is_premium);
  END IF;
END $$;

-- Add diamond_count column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'diamond_count'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN diamond_count integer DEFAULT 0 NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_profiles_diamond_count ON public.profiles USING btree (diamond_count);
  END IF;
END $$;

-- Add ml_user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'ml_user_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN ml_user_id text;
  END IF;
END $$;

-- Add ml_zone_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'ml_zone_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN ml_zone_id text;
  END IF;
END $$;

-- Add filter columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'min_age_filter'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN min_age_filter integer DEFAULT 18;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'max_age_filter'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN max_age_filter integer DEFAULT 35;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'selected_ranks_filter'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN selected_ranks_filter text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'selected_states_filter'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN selected_states_filter text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'selected_cities_filter'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN selected_cities_filter text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'selected_lanes_filter'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN selected_lanes_filter text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'selected_heroes_filter'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN selected_heroes_filter text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'compatibility_mode_filter'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN compatibility_mode_filter boolean DEFAULT true;
  END IF;
END $$;