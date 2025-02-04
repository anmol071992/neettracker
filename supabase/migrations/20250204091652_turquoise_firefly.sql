/*
  # Learning Management System Schema

  1. New Tables
    - `profiles`
      - User profile information
      - Study preferences and goals
    - `study_sessions`
      - Track study time and activities
    - `study_plans`
      - Daily/weekly schedules
      - Task prioritization
    - `achievements`
      - Track milestones and progress
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  roll_number text UNIQUE NOT NULL,
  education_level text NOT NULL,
  study_hours_target integer NOT NULL,
  learning_style text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  
  CONSTRAINT valid_roll_number CHECK (roll_number ~ '^[0-9]{4}$')
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subject_id text NOT NULL,
  chapter_id text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration integer, -- in minutes
  focus_score integer CHECK (focus_score BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_subject CHECK (subject_id IN ('physics', 'chemistry', 'biology'))
);

-- Create study_plans table
CREATE TABLE IF NOT EXISTS study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subject_id text NOT NULL,
  chapter_id text NOT NULL,
  scheduled_date date NOT NULL,
  duration integer NOT NULL, -- in minutes
  priority text NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'missed')),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_subject CHECK (subject_id IN ('physics', 'chemistry', 'biology'))
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('milestone', 'streak', 'performance')),
  points integer NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Profiles policies
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

-- Study sessions policies
CREATE POLICY "Users can view their own study sessions"
  ON study_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create study sessions"
  ON study_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
  ON study_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Study plans policies
CREATE POLICY "Users can view their own study plans"
  ON study_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create study plans"
  ON study_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans"
  ON study_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view their own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS study_sessions_user_date_idx ON study_sessions(user_id, start_time);
CREATE INDEX IF NOT EXISTS study_plans_user_date_idx ON study_plans(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS achievements_user_type_idx ON achievements(user_id, type);