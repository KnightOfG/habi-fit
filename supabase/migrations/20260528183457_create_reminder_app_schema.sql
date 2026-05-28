/*
  # Create Reminder Tracker App Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `color` (text, default hex color)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
    - `reminders`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `reminder_date` (date, not null)
      - `reminder_time` (time, not null)
      - `category_id` (uuid, references categories)
      - `user_id` (uuid, references auth.users)
      - `is_done` (boolean, default false)
      - `notified_10min` (boolean, default false) - tracks if 10-min-before notification was sent
      - `notified_5min` (boolean, default false) - tracks if 5-min-before notification was sent
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `comments`
      - `id` (uuid, primary key)
      - `reminder_id` (uuid, references reminders)
      - `user_id` (uuid, references auth.users)
      - `content` (text, not null)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Separate policies for SELECT, INSERT, UPDATE, DELETE

  3. Important Notes
    - Categories are per-user for full isolation
    - Cascading deletes: deleting a category nullifies reminders in that category
    - Deleting a reminder cascades to its comments
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#4a9eff',
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  reminder_date date NOT NULL,
  reminder_time time NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_done boolean DEFAULT false,
  notified_10min boolean DEFAULT false,
  notified_5min boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id uuid NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own comments"
  ON comments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON reminders(user_id, reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_category ON reminders(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_time ON reminders(user_id, reminder_date, reminder_time);
CREATE INDEX IF NOT EXISTS idx_comments_reminder ON comments(reminder_id);
