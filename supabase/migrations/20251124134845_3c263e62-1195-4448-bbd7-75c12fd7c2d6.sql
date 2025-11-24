-- حذف تریگرهای تکراری و اصلاح ساختار created_by

-- 1️⃣ حذف تمام تریگرهای قبلی
DROP TRIGGER IF EXISTS set_creator_before_insert ON neohi_chats;
DROP TRIGGER IF EXISTS set_created_by_trigger ON neohi_chats;
DROP TRIGGER IF EXISTS set_chat_created_by ON neohi_chats;

-- 2️⃣ تغییر created_by به nullable (بدون default)
ALTER TABLE neohi_chats 
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN created_by DROP NOT NULL;

-- 3️⃣ ایجاد تریگر واحد و صحیح
CREATE TRIGGER set_creator_before_insert
BEFORE INSERT ON neohi_chats
FOR EACH ROW
EXECUTE FUNCTION set_chat_creator();

-- 4️⃣ update کردن رکوردهای موجود که created_by ندارند
UPDATE neohi_chats 
SET created_by = (
  SELECT user_id 
  FROM neohi_chat_members 
  WHERE chat_id = neohi_chats.id 
  AND role = 'owner' 
  LIMIT 1
)
WHERE created_by IS NULL;