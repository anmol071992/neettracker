/*
  # Fix authentication schema for phone-based login

  1. Changes
    - Reset profiles table structure for clean auth
    - Add proper phone number and email handling
    - Add proper constraints and indexes
    - Clean up any existing data issues
*/

-- First, clean up any existing data
TRUNCATE profiles CASCADE;

-- Drop existing constraints and indexes
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_phone_number_key,
  DROP CONSTRAINT IF EXISTS valid_phone_number,
  DROP CONSTRAINT IF EXISTS valid_roll_number;

DROP INDEX IF EXISTS profiles_phone_number_idx;
DROP INDEX IF EXISTS profiles_phone_email_idx;

-- Reset profiles table structure
ALTER TABLE profiles
  ALTER COLUMN phone_number SET NOT NULL,
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN education_level SET DEFAULT '',
  ALTER COLUMN study_hours_target SET DEFAULT 6,
  ALTER COLUMN learning_style SET DEFAULT '';

-- Add proper phone number validation
ALTER TABLE profiles
  ADD CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\d{10}$');

-- Add unique constraint to phone number
ALTER TABLE profiles
  ADD CONSTRAINT profiles_phone_number_key UNIQUE (phone_number);

-- Add email column for auth
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN email text GENERATED ALWAYS AS (phone_number || '@neettracker.app') STORED;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX profiles_phone_email_idx ON profiles(phone_number, email);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

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