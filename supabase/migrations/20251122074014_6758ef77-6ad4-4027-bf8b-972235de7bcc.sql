-- Fix the INSERT policy for neohi_chats to properly check created_by
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON public.neohi_chats;

-- Create proper INSERT policy that checks created_by matches auth.uid()
CREATE POLICY "enable_insert_for_authenticated_users"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid() OR created_by IS NULL);