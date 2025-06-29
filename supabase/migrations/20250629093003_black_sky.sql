/*
  # Add mood-based writing prompts

  1. New Data
    - Add more writing prompts categorized by mood
    - Include general prompts that work for any mood

  2. Categories
    - Mood-specific prompts (happy, sad, excited, peaceful, anxious, grateful, reflective, energetic)
    - General prompts that work for any mood
*/

-- Add mood-based writing prompts
INSERT INTO writing_prompts (prompt, category) VALUES
  -- Happy mood prompts
  ('What made you smile today?', 'happy'),
  ('Describe a moment of pure joy you experienced recently.', 'happy'),
  ('What are you celebrating right now?', 'happy'),
  ('Write about something that fills you with happiness.', 'happy'),
  ('What positive change have you noticed in yourself lately?', 'happy'),

  -- Sad mood prompts
  ('What would help you feel better right now?', 'sad'),
  ('Write a letter to yourself offering comfort.', 'sad'),
  ('What lesson might this difficult time be teaching you?', 'sad'),
  ('Describe a time when you overcame sadness before.', 'sad'),
  ('What support do you need right now?', 'sad'),

  -- Excited mood prompts
  ('What are you most looking forward to?', 'excited'),
  ('Describe the energy you''re feeling right now.', 'excited'),
  ('What new adventure do you want to embark on?', 'excited'),
  ('Write about a dream that excites you.', 'excited'),
  ('What opportunity has you feeling energized?', 'excited'),

  -- Peaceful mood prompts
  ('What brings you a sense of calm?', 'peaceful'),
  ('Describe your perfect quiet moment.', 'peaceful'),
  ('What in nature makes you feel most at peace?', 'peaceful'),
  ('Write about a place where you feel completely relaxed.', 'peaceful'),
  ('What simple pleasure brings you contentment?', 'peaceful'),

  -- Anxious mood prompts
  ('What would you tell a friend who was feeling anxious?', 'anxious'),
  ('List three things you can control right now.', 'anxious'),
  ('What helps you feel grounded when worried?', 'anxious'),
  ('Write about a time you successfully handled anxiety.', 'anxious'),
  ('What breathing space do you need today?', 'anxious'),

  -- Grateful mood prompts
  ('What small thing are you grateful for today?', 'grateful'),
  ('Who in your life deserves appreciation?', 'grateful'),
  ('What opportunity are you thankful for?', 'grateful'),
  ('Describe a kindness someone showed you recently.', 'grateful'),
  ('What about your current situation brings gratitude?', 'grateful'),

  -- Reflective mood prompts
  ('What have you learned about yourself this week?', 'reflective'),
  ('How have you grown in the past month?', 'reflective'),
  ('What pattern in your life are you noticing?', 'reflective'),
  ('What question has been on your mind lately?', 'reflective'),
  ('What would you do differently if you could?', 'reflective'),

  -- Energetic mood prompts
  ('What project are you excited to tackle?', 'energetic'),
  ('How do you want to use this burst of energy?', 'energetic'),
  ('What goal feels achievable right now?', 'energetic'),
  ('Describe what''s motivating you today.', 'energetic'),
  ('What action do you feel ready to take?', 'energetic'),

  -- Additional general prompts
  ('What''s one thing you want to remember about today?', 'general'),
  ('If today had a theme song, what would it be and why?', 'general'),
  ('What conversation do you wish you could have?', 'general'),
  ('What''s something you''re curious about right now?', 'general'),
  ('How do you want to feel tomorrow?', 'general'),
  ('What''s a small win you can celebrate today?', 'general'),
  ('What would make today feel complete?', 'general'),
  ('What story do you want to tell about this moment?', 'general'),
  ('What advice would your future self give you?', 'general'),
  ('What are you ready to let go of?', 'general');