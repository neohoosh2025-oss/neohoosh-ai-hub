-- حذف policy اشتباه
DROP POLICY IF EXISTS "Users can create chats as themselves" ON neohi_chats;

-- ایجاد policy صحیح که چک می‌کنه created_by با auth.uid() برابر باشه
CREATE POLICY "Users can create chats as themselves" 
ON neohi_chats 
FOR INSERT 
TO authenticated
WITH CHECK (created_by = auth.uid() OR created_by IS NULL);