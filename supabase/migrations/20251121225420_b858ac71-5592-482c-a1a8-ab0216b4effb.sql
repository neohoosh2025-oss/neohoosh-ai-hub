-- Add approved column to comments table
ALTER TABLE public.comments 
ADD COLUMN approved boolean NOT NULL DEFAULT false;

-- Add index for better performance on approved comments
CREATE INDEX idx_comments_approved ON public.comments(approved);

-- Update RLS policy to show approved comments to everyone
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

CREATE POLICY "Anyone can view approved comments"
ON public.comments
FOR SELECT
USING (approved = true);

-- Allow users to view their own comments regardless of approval status
CREATE POLICY "Users can view their own comments"
ON public.comments
FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));