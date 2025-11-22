-- حذف policy فعلی
DROP POLICY IF EXISTS "Users can create chats as themselves" ON public.neohi_chats;

-- ایجاد policy که created_by رو اختیاری میکنه
CREATE POLICY "Users can create chats as themselves"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (
  (created_by IS NULL AND auth.uid() IS NOT NULL) OR 
  (created_by = auth.uid())
);