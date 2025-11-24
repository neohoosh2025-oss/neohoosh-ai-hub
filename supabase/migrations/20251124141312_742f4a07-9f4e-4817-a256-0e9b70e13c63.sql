-- مشکل: INSERT policy فقط اجازه می‌دهد کاربر خودش را اضافه کند
-- ولی برای DM و Group باید بتوانیم کاربران دیگر را هم اضافه کنیم
-- راه حل: security definer function برای چک کردن مالکیت چت

-- ساخت تابع برای چک کردن آیا کاربر owner/admin چت است یا نه
CREATE OR REPLACE FUNCTION public.can_add_chat_members(p_chat_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM neohi_chat_members
    WHERE chat_id = p_chat_id
      AND user_id = p_user_id
      AND role IN ('owner', 'admin')
  ) OR (
    -- اگر چت تازه ساخته شده و هنوز member نداره، owner که ساخته می‌تونه اضافه کنه
    SELECT created_by = p_user_id 
    FROM neohi_chats 
    WHERE id = p_chat_id
  );
$$;

-- حذف policy قدیمی
DROP POLICY IF EXISTS "Users can join chats" ON neohi_chat_members;

-- ساخت policy جدید
CREATE POLICY "Users can add members to chats"
ON neohi_chat_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- کاربر می‌تواند خودش را اضافه کند
  auth.uid() = user_id 
  OR 
  -- یا اگر owner/admin چت باشد، می‌تواند دیگران را هم اضافه کند
  can_add_chat_members(chat_id, auth.uid())
);