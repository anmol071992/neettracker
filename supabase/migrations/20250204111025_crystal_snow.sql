/*
  # Study System Tables

  1. New Tables
    - chapter_progress: Track student progress through chapters
    - test_scores: Store test results and performance data
    - study_settings: User study preferences and goals
    - study_tasks: Daily study tasks and assignments

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Create indexes for performance
*/

-- Create chapter_progress table
CREATE TABLE IF NOT EXISTS chapter_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subject_id text NOT NULL,
  chapter_id text NOT NULL,
  is_ncert_read boolean DEFAULT false,
  is_video_watched boolean DEFAULT false,
  is_practice_done boolean DEFAULT false,
  revision_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_subject CHECK (subject_id IN ('physics', 'chemistry', 'biology')),
  UNIQUE(user_id, subject_id, chapter_id)
);

-- Create test_scores table
CREATE TABLE IF NOT EXISTS test_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('subject', 'full')),
  scores jsonb NOT NULL,
  remarks text,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),

  CONSTRAINT valid_scores_format CHECK (
    jsonb_typeof(scores) = 'array' AND
    jsonb_array_length(scores) > 0
  )
);

-- Create study_settings table
CREATE TABLE IF NOT EXISTS study_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  daily_hours integer NOT NULL CHECK (daily_hours BETWEEN 1 AND 24),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  UNIQUE(user_id)
);

-- Create study_tasks table
CREATE TABLE IF NOT EXISTS study_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subject_id text NOT NULL,
  chapter_id text NOT NULL,
  date date NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  is_completed boolean DEFAULT false,
  priority text NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  type text NOT NULL CHECK (type IN ('theory', 'practice')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_subject CHECK (subject_id IN ('physics', 'chemistry', 'biology'))
);

-- Enable Row Level Security
ALTER TABLE chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Chapter Progress policies
  DROP POLICY IF EXISTS "Users can view their own progress" ON chapter_progress;
  DROP POLICY IF EXISTS "Users can create their progress" ON chapter_progress;
  DROP POLICY IF EXISTS "Users can update their own progress" ON chapter_progress;

  -- Test Scores policies
  DROP POLICY IF EXISTS "Users can view their own test scores" ON test_scores;
  DROP POLICY IF EXISTS "Users can add test scores" ON test_scores;

  -- Study Settings policies
  DROP POLICY IF EXISTS "Users can view their own study settings" ON study_settings;
  DROP POLICY IF EXISTS "Users can manage their study settings" ON study_settings;

  -- Study Tasks policies
  DROP POLICY IF EXISTS "Users can view their own tasks" ON study_tasks;
  DROP POLICY IF EXISTS "Users can manage their tasks" ON study_tasks;
END $$;

-- Create policies for chapter_progress
CREATE POLICY "Users can view their own progress"
  ON chapter_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their progress"
  ON chapter_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON chapter_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for test_scores
CREATE POLICY "Users can view their own test scores"
  ON test_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add test scores"
  ON test_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for study_settings
CREATE POLICY "Users can view their own study settings"
  ON study_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their study settings"
  ON study_settings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for study_tasks
CREATE POLICY "Users can view their own tasks"
  ON study_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their tasks"
  ON study_tasks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chapter_progress_user_subject_idx ON chapter_progress(user_id, subject_id);
CREATE INDEX IF NOT EXISTS test_scores_user_date_idx ON test_scores(user_id, date);
CREATE INDEX IF NOT EXISTS study_tasks_user_date_idx ON study_tasks(user_id, date);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_chapter_progress_updated_at ON chapter_progress;
CREATE TRIGGER update_chapter_progress_updated_at
  BEFORE UPDATE ON chapter_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_settings_updated_at ON study_settings;
CREATE TRIGGER update_study_settings_updated_at
  BEFORE UPDATE ON study_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_tasks_updated_at ON study_tasks;
CREATE TRIGGER update_study_tasks_updated_at
  BEFORE UPDATE ON study_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();