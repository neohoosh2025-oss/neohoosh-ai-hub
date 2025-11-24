-- ========================================
-- بازنویسی کامل RLS و تریگرها برای neohi_chats
-- ========================================

-- 1️⃣ ایجاد تریگر برای set کردن خودکار created_by
CREATE OR REPLACE FUNCTION set_chat_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- تنظیم خودکار created_by به auth.uid()
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- حذف تریگر قبلی اگر وجود داشته باشد
DROP TRIGGER IF EXISTS set_creator_before_insert ON neohi_chats;

-- ایجاد تریگر جدید
CREATE TRIGGER set_creator_before_insert
BEFORE INSERT ON neohi_chats
FOR EACH ROW
EXECUTE FUNCTION set_chat_creator();

-- 2️⃣ تریگر برای اضافه کردن خودکار سازنده به chat_members
CREATE OR REPLACE FUNCTION add_creator_to_chat_members()
RETURNS TRIGGER AS $$
BEGIN
  -- فقط برای گروه‌ها و کانال‌ها (نه DM)
  -- برای DM، اعضا در کد کلاینت اضافه می‌شوند
  IF NEW.type IN ('group', 'channel') THEN
    INSERT INTO neohi_chat_members (chat_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- حذف تریگر قبلی اگر وجود داشته باشد
DROP TRIGGER IF EXISTS add_creator_as_member ON neohi_chats;

-- ایجاد تریگر جدید
CREATE TRIGGER add_creator_as_member
AFTER INSERT ON neohi_chats
FOR EACH ROW
EXECUTE FUNCTION add_creator_to_chat_members();

-- 3️⃣ حذف تمام پالیسی‌های قدیمی
DROP POLICY IF EXISTS "Users can create chats" ON neohi_chats;
DROP POLICY IF EXISTS "Users can view their chats" ON neohi_chats;
DROP POLICY IF EXISTS "Chat owners can update chats" ON neohi_chats;
DROP POLICY IF EXISTS "Chat owners can delete chats" ON neohi_chats;
DROP POLICY IF EXISTS "enable_select_for_chat_members" ON neohi_chats;
DROP POLICY IF EXISTS "enable_update_for_chat_owners" ON neohi_chats;

-- 4️⃣ ایجاد پالیسی‌های جدید و استاندارد

-- ✅ INSERT: کاربران احراز هویت شده می‌توانند چت بسازند
CREATE POLICY "Users can create chats"
ON neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- ✅ SELECT: فقط چت‌هایی که کاربر عضو آن‌هاست
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

-- ✅ UPDATE: فقط owner و admin می‌توانند چت را ویرایش کنند
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

-- ✅ DELETE: فقط سازنده می‌تواند چت را حذف کند
CREATE POLICY "Chat owners can delete chats"
ON neohi_chats
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- 5️⃣ مطمئن شدن از فعال بودن RLS
ALTER TABLE neohi_chats ENABLE ROW LEVEL SECURITY;

-- 6️⃣ ایجاد ایندکس برای بهبود عملکرد
CREATE INDEX IF NOT EXISTS idx_neohi_chat_members_user_id 
ON neohi_chat_members(user_id);

CREATE INDEX IF NOT EXISTS idx_neohi_chat_members_chat_id 
ON neohi_chat_members(chat_id);

CREATE INDEX IF NOT EXISTS idx_neohi_chats_created_by 
ON neohi_chats(created_by);