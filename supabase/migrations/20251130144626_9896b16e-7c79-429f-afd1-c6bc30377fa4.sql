-- Create voice_calls table for storing call recordings and metadata
CREATE TABLE IF NOT EXISTS public.voice_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  voice_type TEXT NOT NULL DEFAULT 'alloy',
  audio_url TEXT,
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_calls ENABLE ROW LEVEL SECURITY;

-- Policies for voice_calls
CREATE POLICY "Users can view their own calls"
  ON public.voice_calls
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calls"
  ON public.voice_calls
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calls"
  ON public.voice_calls
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calls"
  ON public.voice_calls
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_voice_calls_updated_at
  BEFORE UPDATE ON public.voice_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_voice_calls_user_id ON public.voice_calls(user_id);
CREATE INDEX idx_voice_calls_created_at ON public.voice_calls(created_at DESC);