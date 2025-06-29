/*
  # Journal Application Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text, optional)
      - `bio` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `content` (text)
      - `mood` (text, optional)
      - `image_url` (text, optional)
      - `is_private` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `writing_prompts`
      - `id` (uuid, primary key)
      - `prompt` (text)
      - `category` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Profiles are readable by authenticated users, writable by owner
    - Journal entries are only accessible by the owner