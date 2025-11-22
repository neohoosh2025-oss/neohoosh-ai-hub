-- Drop all existing INSERT policies on neohi_chats
DROP POLICY IF EXISTS "Authenticated users can create chats" ON public.neohi_chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.neohi_chats;

-- Create a simple, permissive INSERT policy for any authenticated user
CREATE POLICY "Allow authenticated users to create chats"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (true);