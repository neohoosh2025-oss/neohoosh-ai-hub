-- Create table for tracking message deletions per user
CREATE TABLE IF NOT EXISTS public.neohi_message_deletions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES neohi_messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES neohi_users(id) ON DELETE CASCADE NOT NULL,
  deleted_at timestamp with time zone DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.neohi_message_deletions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can delete messages for themselves
CREATE POLICY "Users can delete messages for themselves"
ON public.neohi_message_deletions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own deletions
CREATE POLICY "Users can view their own deletions"
ON public.neohi_message_deletions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add delete policy for neohi_messages (delete for everyone - only sender)
CREATE POLICY "Senders can delete their messages for everyone"
ON public.neohi_messages
FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);