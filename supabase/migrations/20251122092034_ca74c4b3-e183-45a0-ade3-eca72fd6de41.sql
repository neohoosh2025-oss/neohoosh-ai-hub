-- مرحله 1: created_by رو nullable میکنیم
ALTER TABLE public.neohi_chats 
ALTER COLUMN created_by DROP NOT NULL,
ALTER COLUMN created_by DROP DEFAULT;

-- مرحله 2: حذف policy قبلی
DROP POLICY IF EXISTS "Users can create chats as themselves" ON public.neohi_chats;

-- مرحله 3: policy ساده - فقط authenticated باشه کافیه
CREATE POLICY "Users can create chats as themselves"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (true);

-- مرحله 4: ساخت trigger برای ست کردن created_by
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_chat_created_by
BEFORE INSERT ON public.neohi_chats
FOR EACH ROW
EXECUTE FUNCTION set_created_by();