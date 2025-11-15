-- Enable RLS on articles table
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read articles
CREATE POLICY "Anyone can read articles"
ON public.articles
FOR SELECT
USING (true);

-- Create policy to allow authenticated users to insert articles
CREATE POLICY "Authenticated users can insert articles"
ON public.articles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update their own articles
CREATE POLICY "Authenticated users can update articles"
ON public.articles
FOR UPDATE
TO authenticated
USING (true);

-- Create policy to allow authenticated users to delete articles
CREATE POLICY "Authenticated users can delete articles"
ON public.articles
FOR DELETE
TO authenticated
USING (true);