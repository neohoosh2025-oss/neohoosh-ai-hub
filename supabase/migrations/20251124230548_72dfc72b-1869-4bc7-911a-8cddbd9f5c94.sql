-- Drop the old constraint
ALTER TABLE neohi_messages DROP CONSTRAINT neohi_messages_message_type_check;

-- Add new constraint with audio and document types
ALTER TABLE neohi_messages ADD CONSTRAINT neohi_messages_message_type_check 
CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text, 'voice'::text, 'audio'::text, 'document'::text, 'sticker'::text, 'file'::text]));