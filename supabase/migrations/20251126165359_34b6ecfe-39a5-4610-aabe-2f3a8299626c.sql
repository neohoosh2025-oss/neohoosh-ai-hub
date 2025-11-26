-- اضافه کردن field برای تشخیص پیام‌های AI
ALTER TABLE public.neohi_messages 
ADD COLUMN IF NOT EXISTS is_ai_message boolean DEFAULT false;

-- ایجاد index برای کوئری‌های سریع‌تر
CREATE INDEX IF NOT EXISTS idx_neohi_messages_is_ai 
ON public.neohi_messages(is_ai_message) 
WHERE is_ai_message = true;