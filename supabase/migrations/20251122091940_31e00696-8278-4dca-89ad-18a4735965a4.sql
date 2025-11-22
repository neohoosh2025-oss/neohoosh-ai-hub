-- حذف policy فعلی
DROP POLICY IF EXISTS "Users can create chats as themselves" ON public.neohi_chats;

-- ساخت policy جدید - خیلی ساده
-- چون created_by یک default value داره (auth.uid())، وقتی user چیزی نفرسته،
-- خودکار همون user میشه
CREATE POLICY "Users can create chats as themselves"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid() OR created_by IS NULL);