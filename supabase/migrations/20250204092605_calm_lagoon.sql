/*
  # Fix profiles table RLS policies

  1. Changes
    - Add INSERT policy for profiles table to allow new user registration
    - Keep existing policies for SELECT and UPDATE

  2. Security
    - Only allows inserting profiles where the user ID matches the authenticated user's ID
    - Maintains existing row-level security
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate policies with INSERT permission
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);