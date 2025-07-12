/*
  # Fix swipe rewind functionality

  1. Security Policy
    - Add DELETE policy for `swipes` table to allow users to delete their own swipes
    - This enables the rewind functionality to work properly

  2. Changes
    - Users can now delete swipes where they are the swiper
    - Fixes the rewind button functionality that was failing due to missing DELETE permissions
*/

-- Add DELETE policy for swipes table
CREATE POLICY "Users can delete their own swipes"
  ON swipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = swiper_id);