-- Fix function search path by replacing the function with proper settings
CREATE OR REPLACE FUNCTION public.update_neohi_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;