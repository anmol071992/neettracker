/*
  # Create Study Data Tables

  1. New Tables
    - `study_sessions`: Track user study sessions
    - `study_notes`: Store notes with images
    - `study_resources`: Manage study materials
    - `study_analytics`: Store computed analytics data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Implement proper data isolation
*/

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subject_id text NOT NULL,
  chapter_id text NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration integer, -- in minutes
  focus_score integer CHECK (focus_score BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_subject CHECK (subject_id IN ('physics', 'chemistry', 'biology'))
);

-- Create study_notes table
CREATE TABLE IF NOT EXISTS study_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subject_id text NOT NULL,
  chapter_id text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  image_urls text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_subject CHECK (subject_id IN ('physics', 'chemistry', 'biology'))
);

-- Create study_resources table
CREATE TABLE IF NOT EXISTS study_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subject_id text NOT NULL,
  chapter_id text NOT NULL,
  title text NOT NULL,
  description text,
  resource_type text NOT NULL CHECK (resource_type IN ('video', 'document', 'link', 'other')),
  url text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_subject CHECK (subject_id IN ('physics', 'chemistry', 'biology'))
);

-- Create study_analytics table
CREATE TABLE IF NOT EXISTS study_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subject_id text NOT NULL,
  chapter_id text NOT NULL,
  study_time integer DEFAULT 0, -- total minutes
  focus_score_avg numeric(3,2) DEFAULT 0,
  revision_count integer DEFAULT 0,
  last_studied timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_subject CHECK (subject_id IN ('physics', 'chemistry', 'biology')),
  UNIQUE (user_id, subject_id, chapter_id)
);

-- Enable RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_analytics ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX study_sessions_user_time_idx ON study_sessions(user_id, start_time);
CREATE INDEX study_notes_user_subject_idx ON study_notes(user_id, subject_id, chapter_id);
CREATE INDEX study_resources_user_subject_idx ON study_resources(user_id, subject_id, chapter_id);
CREATE INDEX study_analytics_user_subject_idx ON study_analytics(user_id, subject_id, chapter_id);