-- پاک کردن DEFAULT که کار نمی‌کنه
ALTER TABLE public.neohi_chats 
ALTER COLUMN created_by DROP DEFAULT;

-- درست کردن سیاست INSERT که created_by رو بررسی کنه
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON public.neohi_chats;

CREATE POLICY "Users can create chats as themselves"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());