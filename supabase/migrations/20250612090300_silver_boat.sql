/*
  # Create writing prompts table

  1. New Tables
    - `writing_prompts`
      - Daily writing prompts to inspire users
      - Categorized prompts for different moods/themes

  2. Security
    - Enable RLS on `writing_prompts` table
    - Add policies for read access to all authenticated users
*/

CREATE TABLE IF NOT EXISTS writing_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view writing prompts
CREATE POLICY "Authenticated users can view writing prompts"
  ON writing_prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample writing prompts
INSERT INTO writing_prompts (prompt, category) VALUES
  ('What are three things you''re grateful for today?', 'gratitude'),
  ('Describe a moment when you felt truly happy.', 'emotions'),
  ('What would you tell your younger self?', 'reflection'),
  ('Write about a place that makes you feel peaceful.', 'places'),
  ('What challenge did you overcome recently?', 'growth'),
  ('Describe your perfect day from start to finish.', 'dreams'),
  ('What lesson did you learn this week?', 'learning'),
  ('Write about someone who inspires you.', 'people'),
  ('What are you looking forward to?', 'future'),
  ('Describe a small act of kindness you witnessed.', 'kindness'),
  ('What makes you feel most alive?', 'passion'),
  ('Write about a book or movie that changed your perspective.', 'influence'),
  ('What tradition do you cherish most?', 'family'),
  ('Describe a goal you''re working towards.', 'goals'),
  ('What would you do if you had no fear?', 'courage');

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS writing_prompts_category_idx ON writing_prompts(category);