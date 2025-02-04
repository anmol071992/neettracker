/*
  # Create Storage Buckets for File Storage

  1. Storage Buckets
    - `mistake_images`: For storing mistake-related images
    - `resources`: For storing study resources and materials

  2. Security
    - Enable RLS on all buckets
    - Add policies for authenticated users
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('mistake_images', 'Mistake Images', false),
  ('resources', 'Study Resources', false);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policies for mistake_images bucket
CREATE POLICY "Authenticated users can upload mistake images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mistake_images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own mistake images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'mistake_images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own mistake images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'mistake_images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own mistake images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'mistake_images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for resources bucket
CREATE POLICY "Authenticated users can view resources"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resources');