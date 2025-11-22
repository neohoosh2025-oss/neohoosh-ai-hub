
-- جعل created_by إلزامي وإضافة قيمة افتراضية
ALTER TABLE public.neohi_chats 
ALTER COLUMN created_by SET NOT NULL,
ALTER COLUMN created_by SET DEFAULT auth.uid();

-- حذف السياسة القديمة
DROP POLICY IF EXISTS "Users can create chats as themselves" ON public.neohi_chats;

-- إنشاء سياسة جديدة بسيطة
CREATE POLICY "Users can create chats as themselves"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);
