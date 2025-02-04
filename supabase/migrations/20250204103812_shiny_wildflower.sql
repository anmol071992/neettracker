/*
  # Add image support for mistakes

  1. Changes
    - Add image URL columns to mistakes table
    - Create index for better query performance
    - Add storage bucket if not exists
    - Update storage policies if needed

  2. Security
    - Ensure proper file access control
    - Maintain RLS policies
*/

-- Add image URL columns to mistakes table
ALTER TABLE mistakes
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS solution_image_url text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS mistakes_user_subject_idx 
ON mistakes(user_id, subject_id, chapter_id);

-- Create storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('mistake_images', 'Mistake Images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can upload mistake images" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view mistake images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own mistake images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own mistake images" ON storage.objects;
END $$;

-- Create new policies
DO $$
BEGIN
  -- Upload policy
  CREATE POLICY "Authenticated users can upload mistake images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'mistake_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

  -- View policy
  CREATE POLICY "Anyone can view mistake images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'mistake_images');

  -- Update policy
  CREATE POLICY "Users can update their own mistake images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'mistake_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

  -- Delete policy
  CREATE POLICY "Users can delete their own mistake images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'mistake_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
END $$;