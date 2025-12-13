-- Create calls table for voice/video calling
CREATE TABLE public.neohi_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.neohi_chats(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES public.neohi_users(id),
  callee_id UUID NOT NULL REFERENCES public.neohi_users(id),
  call_type TEXT NOT NULL DEFAULT 'voice', -- 'voice' or 'video'
  status TEXT NOT NULL DEFAULT 'ringing', -- 'ringing', 'connected', 'ended', 'missed', 'declined'
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create call signaling table for WebRTC
CREATE TABLE public.neohi_call_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES public.neohi_calls(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.neohi_users(id),
  signal_type TEXT NOT NULL, -- 'offer', 'answer', 'ice-candidate'
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.neohi_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neohi_call_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calls
CREATE POLICY "Users can view their own calls"
ON public.neohi_calls FOR SELECT
USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Users can create calls"
ON public.neohi_calls FOR INSERT
WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their calls"
ON public.neohi_calls FOR UPDATE
USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- RLS Policies for signals
CREATE POLICY "Users can view signals for their calls"
ON public.neohi_call_signals FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.neohi_calls 
  WHERE id = call_id AND (caller_id = auth.uid() OR callee_id = auth.uid())
));

CREATE POLICY "Users can insert signals for their calls"
ON public.neohi_call_signals FOR INSERT
WITH CHECK (auth.uid() = sender_id AND EXISTS (
  SELECT 1 FROM public.neohi_calls 
  WHERE id = call_id AND (caller_id = auth.uid() OR callee_id = auth.uid())
));

-- Enable realtime for calls
ALTER PUBLICATION supabase_realtime ADD TABLE public.neohi_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.neohi_call_signals;