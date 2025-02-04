/*
  # Update profiles table schema

  1. Changes
    - Make roll_number column nullable
    - Remove roll_number constraint
    - Add phone_number index for performance
  
  Note: We're not adding a unique constraint on phone_number immediately
  to avoid conflicts with existing data. This should be handled as a 
  separate data cleanup task.
*/

-- Make roll_number nullable and remove constraint
ALTER TABLE profiles 
  ALTER COLUMN roll_number DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS valid_roll_number;

-- Add index on phone_number for better query performance
CREATE INDEX IF NOT EXISTS profiles_phone_number_idx ON profiles(phone_number);

-- Note: Unique constraint on phone_number will be added after data cleanup