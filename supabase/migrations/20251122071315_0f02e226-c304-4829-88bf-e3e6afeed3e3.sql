-- Create a SECURITY DEFINER function to check chat membership without recursion
CREATE OR REPLACE FUNCTION public.is_chat_member(p_chat_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM neohi_chat_members
    WHERE chat_id = p_chat_id
      AND user_id = p_user_id
  );
$$;

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view members of their chats" ON neohi_chat_members;

-- Create new policy using the SECURITY DEFINER function
CREATE POLICY "Users can view members of their chats"
  ON neohi_chat_members FOR SELECT
  USING (public.is_chat_member(chat_id, auth.uid()));