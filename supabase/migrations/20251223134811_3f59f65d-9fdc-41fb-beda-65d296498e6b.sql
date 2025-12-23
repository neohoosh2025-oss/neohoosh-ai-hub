
-- ============================================
-- FIX 1: neohi_users - Restrict public access
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all neohi users" ON neohi_users;

-- Users can always see their own full profile
CREATE POLICY "Users can view own full profile"
ON neohi_users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can view basic public info of other users (for chat functionality)
-- But sensitive fields like phone should be handled at application level
CREATE POLICY "Users can view contacts and chat members"
ON neohi_users FOR SELECT
TO authenticated
USING (
  -- User is in the same chat
  EXISTS (
    SELECT 1 FROM neohi_chat_members cm1
    JOIN neohi_chat_members cm2 ON cm1.chat_id = cm2.chat_id
    WHERE cm1.user_id = auth.uid() AND cm2.user_id = neohi_users.id
  )
  OR
  -- User is a contact
  EXISTS (
    SELECT 1 FROM neohi_contacts
    WHERE user_id = auth.uid() AND contact_user_id = neohi_users.id
  )
  OR
  -- User is in a call with this person
  EXISTS (
    SELECT 1 FROM neohi_calls
    WHERE (caller_id = auth.uid() AND callee_id = neohi_users.id)
       OR (callee_id = auth.uid() AND caller_id = neohi_users.id)
  )
);

-- ============================================
-- FIX 2: articles - Remove conflicting policies
-- ============================================

-- Remove the permissive policies that override admin restrictions
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON articles;

-- Keep only one select policy
DROP POLICY IF EXISTS "Anyone can read articles" ON articles;

-- ============================================
-- FIX 3: comments - Hide email from public
-- ============================================

-- Drop the policy that shows all approved comments (including emails)
DROP POLICY IF EXISTS "Anyone can view approved comments" ON comments;

-- Create a more restrictive policy - public can see approved comments but we'll handle email hiding at app level
-- Admins can see all comments
CREATE POLICY "Admins can view all comments"
ON comments FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- For public viewing, we'll create a view that hides emails
-- But first, allow authenticated users to see approved comments
CREATE POLICY "Authenticated users can view approved comments"
ON comments FOR SELECT
TO authenticated
USING (approved = true);
