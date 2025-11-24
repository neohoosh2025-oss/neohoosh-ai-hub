-- مشکل: SELECT policy اجازه نمی‌دهد کاربر چت تازه ساخته شده را ببیند
-- چون هنوز عضو chat_members نشده است
-- راه حل: اضافه کردن شرط created_by به SELECT policy

DROP POLICY IF EXISTS "Users can view their chats" ON neohi_chats;

CREATE POLICY "Users can view their chats"
ON neohi_chats
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM neohi_chat_members
    WHERE chat_id = neohi_chats.id
      AND user_id = auth.uid()
  )
);