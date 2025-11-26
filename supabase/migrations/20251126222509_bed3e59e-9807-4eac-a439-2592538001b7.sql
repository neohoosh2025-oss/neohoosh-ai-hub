-- Create trigger to update last_message_at when new message arrives
CREATE OR REPLACE FUNCTION update_chat_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE neohi_chats
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on neohi_messages
DROP TRIGGER IF EXISTS trigger_update_chat_last_message ON neohi_messages;
CREATE TRIGGER trigger_update_chat_last_message
  AFTER INSERT ON neohi_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_last_message_at();