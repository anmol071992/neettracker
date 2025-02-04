/*
  # Add RLS Policies for Study Tables

  1. Security Policies
    - Add RLS policies for study notes
    - Add RLS policies for study resources
    - Add RLS policies for study analytics
    
  Note: Study sessions policies already exist and are skipped
*/

-- Create policies for study_notes
CREATE POLICY "Users can view their own notes"
  ON study_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notes"
  ON study_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON study_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON study_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for study_resources
CREATE POLICY "Users can view study resources"
  ON study_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert resources"
  ON study_resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
  ON study_resources FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
  ON study_resources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for study_analytics
CREATE POLICY "Users can view their own analytics"
  ON study_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert analytics"
  ON study_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
  ON study_analytics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);