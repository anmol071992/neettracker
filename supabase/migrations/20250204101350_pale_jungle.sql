/*
  # Fix authentication schema for phone-based login

  1. Changes
    - Add proper phone number validation
    - Add proper email format for auth
    - Add preferences column with proper validation
    - Clean up any existing data issues
*/

-- First, clean up any existing data issues
DELETE FROM profiles WHERE phone_number IS NULL OR phone_number = '';

-- Update phone number validation
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS valid_phone_number,
  ADD CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\d{10}$');

-- Add or update email column
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

-- Ensure unique phone numbers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_phone_number_key'
  ) THEN
    -- First remove any duplicates
    WITH duplicates AS (
      SELECT id, phone_number,
             ROW_NUMBER() OVER (PARTITION BY phone_number ORDER BY created_at DESC) as rn
      FROM profiles
      WHERE phone_number IS NOT NULL
    )
    DELETE FROM profiles
    WHERE id IN (
      SELECT id FROM duplicates WHERE rn > 1
    );

    -- Then add unique constraint
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_phone_number_key UNIQUE (phone_number);
  END IF;
END $$;

-- Update preferences validation
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_preferences'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT valid_preferences;
  END IF;
END $$;

ALTER TABLE profiles
ADD CONSTRAINT valid_preferences CHECK (
  preferences IS NULL OR (
    jsonb_typeof(preferences) = 'object' AND
    (
      preferences->>'improvement_areas' IS NULL OR 
      jsonb_typeof(preferences->'improvement_areas') = 'array'
    ) AND
    (
      preferences->>'subject_preferences' IS NULL OR 
      jsonb_typeof(preferences->'subject_preferences') = 'object'
    )
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_phone_email_idx ON profiles(phone_number, email);