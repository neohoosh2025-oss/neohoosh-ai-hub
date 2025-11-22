-- حذف trigger که مشکل ایجاد می‌کند
DROP TRIGGER IF EXISTS set_chat_creator_trigger ON public.neohi_chats;

-- حذف function
DROP FUNCTION IF EXISTS public.set_chat_creator();

-- تغییر سیاست INSERT برای بررسی auth.uid() بدون نیاز به created_by در body
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON public.neohi_chats;

CREATE POLICY "enable_insert_for_authenticated_users"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (true);

-- اضافه کردن DEFAULT برای created_by که خودکار auth.uid() رو set کنه
ALTER TABLE public.neohi_chats 
ALTER COLUMN created_by SET DEFAULT auth.uid();