-- Create article_translations table for multi-language support
CREATE TABLE public.article_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'ar', 'fa')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, language)
);

-- Enable RLS
ALTER TABLE public.article_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view translations"
ON public.article_translations
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert translations"
ON public.article_translations
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update translations"
ON public.article_translations
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete translations"
ON public.article_translations
FOR DELETE
USING (is_admin(auth.uid()));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_article_translations_updated_at
BEFORE UPDATE ON public.article_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_article_translations_article_id ON public.article_translations(article_id);
CREATE INDEX idx_article_translations_language ON public.article_translations(language);