-- Drop the existing problematic INSERT policy
DROP POLICY IF EXISTS "Users can create chats" ON public.neohi_chats;

-- Create a new, more permissive INSERT policy for authenticated users
CREATE POLICY "Authenticated users can create chats"
ON public.neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (created_by = auth.uid() OR created_by IS NULL)
);

-- Also ensure the created_by gets set automatically if not provided
CREATE OR REPLACE FUNCTION public.set_chat_creator()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger to auto-set creator
DROP TRIGGER IF EXISTS set_chat_creator_trigger ON public.neohi_chats;
CREATE TRIGGER set_chat_creator_trigger
  BEFORE INSERT ON public.neohi_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.set_chat_creator();