-- Enable RLS on neohi_chats if not already enabled
ALTER TABLE public.neohi_chats ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to create chats" ON public.neohi_chats;
DROP POLICY IF EXISTS "Authenticated users can create chats" ON public.neohi_chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.neohi_chats;
DROP POLICY IF EXISTS "Users can view chats they are members of" ON public.neohi_chats;
DROP POLICY IF EXISTS "Chat owners can update chats" ON public.neohi_chats;

-- Create INSERT policy - any authenticated user can create chats
CREATE POLICY "authenticated_users_can_insert_chats" 
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create SELECT policy - users can view chats they are members of
CREATE POLICY "users_can_view_member_chats"
ON public.neohi_chats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM neohi_chat_members 
    WHERE neohi_chat_members.chat_id = neohi_chats.id 
    AND neohi_chat_members.user_id = auth.uid()
  )
);

-- Create UPDATE policy - chat owners/admins can update
CREATE POLICY "owners_can_update_chats"
ON public.neohi_chats
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM neohi_chat_members 
    WHERE neohi_chat_members.chat_id = neohi_chats.id 
    AND neohi_chat_members.user_id = auth.uid() 
    AND neohi_chat_members.role IN ('owner', 'admin')
  )
);