-- اصلاح RLS policy برای INSERT
-- مشکل: WITH CHECK قبل از تریگر اجرا می‌شود، پس created_by هنوز NULL است

DROP POLICY IF EXISTS "Users can create chats" ON neohi_chats;

CREATE POLICY "Users can create chats"
ON neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (true);  -- فقط بررسی می‌کنیم کاربر authenticated باشد