-- Create table for saved articles
CREATE TABLE IF NOT EXISTS public.saved_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Enable RLS
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

-- Policies for saved_articles
CREATE POLICY "Users can view their own saved articles"
  ON public.saved_articles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save articles"
  ON public.saved_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved articles"
  ON public.saved_articles FOR DELETE
  USING (auth.uid() = user_id);

-- Create table for user activity
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Policies for user_activity
CREATE POLICY "Users can view their own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log their activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_saved_articles_user_id ON public.saved_articles(user_id);
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at DESC);