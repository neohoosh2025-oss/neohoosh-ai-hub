-- Create neohi_users table for extended user profiles
CREATE TABLE public.neohi_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create neohi_chats table (dm, group, channel)
CREATE TABLE public.neohi_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('dm', 'group', 'channel')),
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES public.neohi_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Create neohi_chat_members table (many-to-many)
CREATE TABLE public.neohi_chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.neohi_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.neohi_users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_muted BOOLEAN DEFAULT false,
  UNIQUE(chat_id, user_id)
);

-- Create neohi_messages table
CREATE TABLE public.neohi_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.neohi_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.neohi_users(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'voice', 'sticker', 'file')),
  media_url TEXT,
  reply_to UUID REFERENCES public.neohi_messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create neohi_message_status table (delivered, seen)
CREATE TABLE public.neohi_message_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.neohi_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.neohi_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'seen')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create neohi_stories table
CREATE TABLE public.neohi_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.neohi_users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours')
);

-- Create neohi_story_views table
CREATE TABLE public.neohi_story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.neohi_stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.neohi_users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Create neohi_contacts table
CREATE TABLE public.neohi_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.neohi_users(id) ON DELETE CASCADE,
  contact_user_id UUID NOT NULL REFERENCES public.neohi_users(id) ON DELETE CASCADE,
  contact_name TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, contact_user_id)
);

-- Create neohi_typing_indicators table (for real-time typing status)
CREATE TABLE public.neohi_typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.neohi_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.neohi_users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.neohi_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neohi_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neohi_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neohi_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neohi_message_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neohi_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neohi_story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neohi_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neohi_typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for neohi_users
CREATE POLICY "Users can view all neohi users"
  ON public.neohi_users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.neohi_users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.neohi_users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for neohi_chats
CREATE POLICY "Users can view chats they are members of"
  ON public.neohi_chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.neohi_chat_members
      WHERE neohi_chat_members.chat_id = neohi_chats.id
      AND neohi_chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats"
  ON public.neohi_chats FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat owners can update chats"
  ON public.neohi_chats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.neohi_chat_members
      WHERE neohi_chat_members.chat_id = neohi_chats.id
      AND neohi_chat_members.user_id = auth.uid()
      AND neohi_chat_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for neohi_chat_members
CREATE POLICY "Users can view members of their chats"
  ON public.neohi_chat_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.neohi_chat_members AS cm
      WHERE cm.chat_id = neohi_chat_members.chat_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join chats"
  ON public.neohi_chat_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave chats"
  ON public.neohi_chat_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for neohi_messages
CREATE POLICY "Users can view messages in their chats"
  ON public.neohi_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.neohi_chat_members
      WHERE neohi_chat_members.chat_id = neohi_messages.chat_id
      AND neohi_chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their chats"
  ON public.neohi_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.neohi_chat_members
      WHERE neohi_chat_members.chat_id = neohi_messages.chat_id
      AND neohi_chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.neohi_messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- RLS Policies for neohi_message_status
CREATE POLICY "Users can view message status in their chats"
  ON public.neohi_message_status FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.neohi_messages m
      JOIN public.neohi_chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = neohi_message_status.message_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own message status"
  ON public.neohi_message_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message status"
  ON public.neohi_message_status FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for neohi_stories
CREATE POLICY "Users can view stories from contacts"
  ON public.neohi_stories FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.neohi_contacts
      WHERE neohi_contacts.user_id = auth.uid()
      AND neohi_contacts.contact_user_id = neohi_stories.user_id
    )
  );

CREATE POLICY "Users can create their own stories"
  ON public.neohi_stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON public.neohi_stories FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for neohi_story_views
CREATE POLICY "Users can view story views for their stories"
  ON public.neohi_story_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.neohi_stories
      WHERE neohi_stories.id = neohi_story_views.story_id
      AND neohi_stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert story views"
  ON public.neohi_story_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- RLS Policies for neohi_contacts
CREATE POLICY "Users can view their own contacts"
  ON public.neohi_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add contacts"
  ON public.neohi_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove contacts"
  ON public.neohi_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for neohi_typing_indicators
CREATE POLICY "Users can view typing indicators in their chats"
  ON public.neohi_typing_indicators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.neohi_chat_members
      WHERE neohi_chat_members.chat_id = neohi_typing_indicators.chat_id
      AND neohi_chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own typing status"
  ON public.neohi_typing_indicators FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own typing status"
  ON public.neohi_typing_indicators FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_neohi_chats_last_message ON public.neohi_chats(last_message_at DESC);
CREATE INDEX idx_neohi_chat_members_user ON public.neohi_chat_members(user_id);
CREATE INDEX idx_neohi_chat_members_chat ON public.neohi_chat_members(chat_id);
CREATE INDEX idx_neohi_messages_chat ON public.neohi_messages(chat_id, created_at DESC);
CREATE INDEX idx_neohi_messages_sender ON public.neohi_messages(sender_id);
CREATE INDEX idx_neohi_stories_user ON public.neohi_stories(user_id, created_at DESC);
CREATE INDEX idx_neohi_story_views_story ON public.neohi_story_views(story_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_neohi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_neohi_users_updated_at
  BEFORE UPDATE ON public.neohi_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_neohi_updated_at();

CREATE TRIGGER update_neohi_chats_updated_at
  BEFORE UPDATE ON public.neohi_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_neohi_updated_at();

CREATE TRIGGER update_neohi_messages_updated_at
  BEFORE UPDATE ON public.neohi_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_neohi_updated_at();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('neohi-avatars', 'neohi-avatars', true),
  ('neohi-media', 'neohi-media', true),
  ('neohi-stories', 'neohi-stories', true),
  ('neohi-voice', 'neohi-voice', false);

-- Storage policies for neohi-avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'neohi-avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'neohi-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'neohi-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for neohi-media
CREATE POLICY "Anyone can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'neohi-media');

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'neohi-media' AND
    auth.role() = 'authenticated'
  );

-- Storage policies for neohi-stories
CREATE POLICY "Anyone can view stories"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'neohi-stories');

CREATE POLICY "Users can upload their own stories"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'neohi-stories' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for neohi-voice
CREATE POLICY "Chat members can view voice messages"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'neohi-voice');

CREATE POLICY "Authenticated users can upload voice messages"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'neohi-voice' AND
    auth.role() = 'authenticated'
  );

-- Enable realtime for all neohi tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.neohi_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.neohi_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.neohi_chat_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.neohi_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.neohi_message_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.neohi_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.neohi_story_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.neohi_typing_indicators;