-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_created_by_trigger ON neohi_chats;

-- Create trigger to automatically set created_by
CREATE TRIGGER set_created_by_trigger
BEFORE INSERT ON neohi_chats
FOR EACH ROW
EXECUTE FUNCTION set_created_by();