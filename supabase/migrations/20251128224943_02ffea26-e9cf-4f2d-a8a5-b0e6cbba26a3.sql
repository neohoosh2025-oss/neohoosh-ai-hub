-- Create reactions table
CREATE TABLE IF NOT EXISTS public.neohi_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES neohi_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES neohi_users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.neohi_reactions ENABLE ROW LEVEL SECURITY;

-- Users can add reactions to messages in their chats
CREATE POLICY "Users can add reactions to chat messages"
ON public.neohi_reactions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM neohi_messages m
    JOIN neohi_chat_members cm ON cm.chat_id = m.chat_id
    WHERE m.id = message_id AND cm.user_id = auth.uid()
  )
);

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
ON public.neohi_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Users can view reactions in their chats
CREATE POLICY "Users can view reactions in their chats"
ON public.neohi_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM neohi_messages m
    JOIN neohi_chat_members cm ON cm.chat_id = m.chat_id
    WHERE m.id = message_id AND cm.user_id = auth.uid()
  )
);

-- Add realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE neohi_reactions;