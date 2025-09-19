/*
  # ML Duo Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `age` (integer, 13-99)
      - `city` (text)
      - `current_rank` (text)
      - `favorite_heroes` (text array)
      - `favorite_lines` (text array)
      - `bio` (text, optional)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `swipes`
      - `id` (uuid, primary key)
      - `swiper_id` (uuid, references profiles)
      - `swiped_id` (uuid, references profiles)
      - `is_like` (boolean)
      - `created_at` (timestamp)
    
    - `matches`
      - `id` (uuid, primary key)
      - `user1_id` (uuid, references profiles)
      - `user2_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Allow viewing other profiles for matching purposes

  3. Performance
    - Add indexes on frequently queried columns
    - Add trigger for automatic updated_at timestamp
*/

-- Drop existing tables if they exist to ensure clean schema
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  age integer NOT NULL CHECK (age >= 13 AND age <= 99),
  city text NOT NULL,
  current_rank text NOT NULL,
  favorite_heroes text[] NOT NULL DEFAULT '{}',
  favorite_lines text[] NOT NULL DEFAULT '{}',
  bio text DEFAULT '',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create swipes table
CREATE TABLE swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_like boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Create matches table
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CHECK (user1_id != user2_id),
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view other profiles for matching"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create swipes policies
CREATE POLICY "Users can view relevant swipes for matching"
  ON swipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = swiper_id OR (auth.uid() = swiped_id AND is_like = true));


CREATE POLICY "Users can insert their own swipes"
  ON swipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = swiper_id);

-- Create matches policies
CREATE POLICY "Users can view their matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_current_rank ON profiles(current_rank);
CREATE INDEX idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped_id ON swipes(swiped_id);
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();