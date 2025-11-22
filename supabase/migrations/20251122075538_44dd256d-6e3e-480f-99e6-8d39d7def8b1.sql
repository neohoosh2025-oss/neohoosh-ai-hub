-- حذف سیاست فعلی که کار نمی‌کنه
DROP POLICY IF EXISTS "Users can create chats as themselves" ON public.neohi_chats;

-- ایجاد سیاست صحیح با (select auth.uid())
CREATE POLICY "Users can create chats as themselves"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = created_by);