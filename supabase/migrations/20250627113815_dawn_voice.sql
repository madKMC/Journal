/*
  # Create storage bucket for journal images

  1. Storage
    - Create `journal-images` bucket
    - Set up policies for authenticated users
*/

-- Create storage bucket for journal images
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal-images', 'journal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload journal images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own images
CREATE POLICY "Users can view own journal images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own journal images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);