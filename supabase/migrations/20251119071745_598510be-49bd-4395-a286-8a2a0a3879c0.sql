-- Create user_memory table to store persistent user information across conversations
CREATE TABLE IF NOT EXISTS public.user_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  memory_type TEXT NOT NULL, -- 'profile', 'preference', 'fact'
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);

-- Enable RLS
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

-- Users can view their own memory
CREATE POLICY "Users can view their own memory"
ON public.user_memory
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own memory
CREATE POLICY "Users can insert their own memory"
ON public.user_memory
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own memory
CREATE POLICY "Users can update their own memory"
ON public.user_memory
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own memory
CREATE POLICY "Users can delete their own memory"
ON public.user_memory
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_user_memory_updated_at
BEFORE UPDATE ON public.user_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();