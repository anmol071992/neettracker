/*
  # Add preferences column to profiles table
  
  1. Changes
    - Add JSONB preferences column to profiles table to store:
      - Improvement areas
      - Subject preferences
      - Other personalization settings
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add validation check for preferences structure
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