-- First, disable RLS temporarily to clean up
ALTER TABLE public.neohi_chats DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (if any exist)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'neohi_chats') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.neohi_chats';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.neohi_chats ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy - ANY authenticated user can insert
CREATE POLICY "enable_insert_for_authenticated_users"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create SELECT policy - users can view chats they're members of
CREATE POLICY "enable_select_for_chat_members"
ON public.neohi_chats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.neohi_chat_members 
    WHERE neohi_chat_members.chat_id = neohi_chats.id 
    AND neohi_chat_members.user_id = auth.uid()
  )
);

-- Create UPDATE policy - owners can update
CREATE POLICY "enable_update_for_chat_owners"
ON public.neohi_chats
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.neohi_chat_members 
    WHERE neohi_chat_members.chat_id = neohi_chats.id 
    AND neohi_chat_members.user_id = auth.uid() 
    AND neohi_chat_members.role IN ('owner', 'admin')
  )
);