-- Fix neohi-voice storage policy to actually check authentication
DROP POLICY IF EXISTS "Chat members can view voice messages" ON storage.objects;

CREATE POLICY "Authenticated users can view voice messages"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'neohi-voice');
