/*
  # Create mistakes tracking system

  1. New Tables
    - `mistakes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `subject_id` (text)
      - `chapter_id` (text)
      - `content` (text)
      - `priority` (text)
      - `solution` (text, nullable)
      - `created_at` (timestamptz)
      - `is_resolved` (boolean)
      - `revision_count` (integer)
      - `last_revised` (timestamptz, nullable)

  2. Security
    - Enable RLS on `mistakes` table
    - Add policies for authenticated users to:
      - Read their own mistakes
      - Create new mistakes
      - Update their own mistakes
      - Delete their own mistakes
*/

-- Create mistakes table
CREATE TABLE IF NOT EXISTS mistakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subject_id text NOT NULL,
  chapter_id text NOT NULL,
  content text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  solution text,
  created_at timestamptz DEFAULT now(),
  is_resolved boolean DEFAULT false,
  revision_count integer DEFAULT 0,
  last_revised timestamptz,

  CONSTRAINT valid_subject CHECK (subject_id IN ('physics', 'chemistry', 'biology'))
);

-- Enable RLS
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own mistakes"
  ON mistakes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create mistakes"
  ON mistakes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mistakes"
  ON mistakes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mistakes"
  ON mistakes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS mistakes_user_id_idx ON mistakes(user_id);
CREATE INDEX IF NOT EXISTS mistakes_subject_chapter_idx ON mistakes(subject_id, chapter_id);