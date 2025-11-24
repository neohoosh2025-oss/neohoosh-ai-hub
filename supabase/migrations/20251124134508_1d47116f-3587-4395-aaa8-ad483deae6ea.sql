-- اصلاح توابع برای اضافه کردن search_path

-- اصلاح تابع set_chat_creator
CREATE OR REPLACE FUNCTION set_chat_creator()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- اصلاح تابع add_creator_to_chat_members
CREATE OR REPLACE FUNCTION add_creator_to_chat_members()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type IN ('group', 'channel') THEN
    INSERT INTO neohi_chat_members (chat_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
  END IF;
  RETURN NEW;
END;
$$;