-- Fix RLS policies for neohi_chats to allow chat creation

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create chats" ON neohi_chats;
DROP POLICY IF EXISTS "enable_select_for_chat_members" ON neohi_chats;
DROP POLICY IF EXISTS "enable_update_for_chat_owners" ON neohi_chats;

-- Recreate policies with proper conditions
CREATE POLICY "Users can create chats"
ON neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their chats"
ON neohi_chats
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

CREATE POLICY "Chat owners can update chats"
ON neohi_chats
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

CREATE POLICY "Chat owners can delete chats"
ON neohi_chats
FOR DELETE
TO authenticated
USING (created_by = auth.uid());