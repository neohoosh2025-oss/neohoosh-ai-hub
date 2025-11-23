-- Add reasoning_details column to messages table
ALTER TABLE public.messages
ADD COLUMN reasoning_details JSONB;