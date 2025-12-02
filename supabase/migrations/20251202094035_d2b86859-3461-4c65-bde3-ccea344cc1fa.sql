-- Add storage policies for chat-files bucket
-- Policy for INSERT (upload)
CREATE POLICY "Users can upload files to chat-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for SELECT (read)
CREATE POLICY "Users can read files from chat-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for DELETE
CREATE POLICY "Users can delete their own files from chat-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);