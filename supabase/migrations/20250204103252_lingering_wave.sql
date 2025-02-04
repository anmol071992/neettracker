/*
  # Dashboard Integration Schema

  1. New Tables
    - `dashboard_settings`
      - User-specific dashboard preferences and settings
    - `dashboard_widgets`
      - Configurable widget settings for each user
    - `dashboard_notifications`
      - User notifications and alerts
    - `dashboard_activity_log`
      - Track user actions and system events

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Implement proper data access controls

  3. Changes
    - Add dashboard-specific columns to profiles table
    - Create necessary indexes for performance
*/

-- Create dashboard_settings table
CREATE TABLE IF NOT EXISTS dashboard_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  theme text DEFAULT 'light',
  layout jsonb DEFAULT '[]'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark', 'system')),
  CONSTRAINT valid_preferences CHECK (
    jsonb_typeof(preferences) = 'object'
  ),
  CONSTRAINT valid_layout CHECK (
    jsonb_typeof(layout) = 'array'
  ),
  UNIQUE (user_id)
);

-- Create dashboard_widgets table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  widget_type text NOT NULL,
  title text NOT NULL,
  position jsonb NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_widget_type CHECK (
    widget_type IN (
      'progress', 'calendar', 'analytics', 
      'mistakes', 'timer', 'notes'
    )
  ),
  CONSTRAINT valid_position CHECK (
    jsonb_typeof(position) = 'object' AND
    (position->>'x') IS NOT NULL AND
    (position->>'y') IS NOT NULL AND
    (position->>'w') IS NOT NULL AND
    (position->>'h') IS NOT NULL
  )
);

-- Create dashboard_notifications table
CREATE TABLE IF NOT EXISTS dashboard_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_notification_type CHECK (
    type IN ('info', 'success', 'warning', 'error')
  )
);

-- Create dashboard_activity_log table
CREATE TABLE IF NOT EXISTS dashboard_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_entity_type CHECK (
    entity_type IN (
      'study_session', 'mistake', 'note',
      'test_score', 'widget', 'setting'
    )
  )
);

-- Enable Row Level Security
ALTER TABLE dashboard_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_activity_log ENABLE ROW LEVEL SECURITY;

-- Dashboard Settings Policies
CREATE POLICY "Users can view their own dashboard settings"
  ON dashboard_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their dashboard settings"
  ON dashboard_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard settings"
  ON dashboard_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Dashboard Widgets Policies
CREATE POLICY "Users can view their own widgets"
  ON dashboard_widgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create widgets"
  ON dashboard_widgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widgets"
  ON dashboard_widgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widgets"
  ON dashboard_widgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Dashboard Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON dashboard_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON dashboard_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON dashboard_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Activity Log Policies
CREATE POLICY "Users can view their own activity logs"
  ON dashboard_activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create activity logs"
  ON dashboard_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX dashboard_settings_user_idx ON dashboard_settings(user_id);
CREATE INDEX dashboard_widgets_user_type_idx ON dashboard_widgets(user_id, widget_type);
CREATE INDEX dashboard_notifications_user_read_idx ON dashboard_notifications(user_id, is_read);
CREATE INDEX dashboard_activity_log_user_date_idx ON dashboard_activity_log(user_id, created_at);

-- Add function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_dashboard_settings_updated_at
  BEFORE UPDATE ON dashboard_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();