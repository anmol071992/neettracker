/*
  # Update profiles table for phone-based auth

  1. Changes
    - Make phone_number unique
    - Add email column for auth
    - Add validation for phone number format
*/

-- Add unique constraint to phone_number
DO $$ 
BEGIN
  -- First remove any duplicate phone numbers (keep the most recent)
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

  -- Now we can safely add the unique constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_phone_number_key'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_phone_number_key UNIQUE (phone_number);
  END IF;
END $$;

-- Add email column if it doesn't exist
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

-- Add phone number format validation
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS valid_phone_number,
  ADD CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\d{10}$');