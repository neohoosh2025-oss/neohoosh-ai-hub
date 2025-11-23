-- Create testimonials table for homepage reviews
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  display_order INTEGER DEFAULT 0
);

-- Create homepage_stats table
CREATE TABLE IF NOT EXISTS public.homepage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key TEXT NOT NULL UNIQUE,
  stat_value TEXT NOT NULL,
  stat_label TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create homepage_features table
CREATE TABLE IF NOT EXISTS public.homepage_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT DEFAULT 'primary',
  gradient TEXT,
  features_list JSONB,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create homepage_tools table
CREATE TABLE IF NOT EXISTS public.homepage_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT DEFAULT 'primary',
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies for testimonials
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials
  FOR SELECT
  USING (approved = true);

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials
  FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for homepage_stats
CREATE POLICY "Anyone can view active stats"
  ON public.homepage_stats
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage stats"
  ON public.homepage_stats
  FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for homepage_features
CREATE POLICY "Anyone can view active features"
  ON public.homepage_features
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage features"
  ON public.homepage_features
  FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for homepage_tools
CREATE POLICY "Anyone can view active tools"
  ON public.homepage_tools
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage tools"
  ON public.homepage_tools
  FOR ALL
  USING (is_admin(auth.uid()));

-- Insert default data
INSERT INTO public.homepage_stats (stat_key, stat_value, stat_label, display_order) VALUES
  ('conversations', '+۶۰۰۰', 'گفتگو در ماه اخیر', 1),
  ('support', '۲۴/۷', 'پشتیبانی آنلاین', 2),
  ('satisfaction', '۱۰۰٪', 'رضایت کاربران', 3);

INSERT INTO public.homepage_features (title, description, icon_name, gradient, features_list, display_order) VALUES
  ('چت‌بات هوشمند', 'پاسخ سریع، حافظه مکالمه و شخصی‌سازی رفتار برای تجربه‌ای منحصربه‌فرد', 'MessageCircle', 'from-primary/20 to-primary/5', '["پاسخ سریع", "حافظه مکالمه", "شخصی‌سازی"]', 1),
  ('ابزارهای قدرتمند AI', 'تولید متن، خلاصه‌سازی، ترجمه و تحلیل با دقت و سرعت بالا', 'Wand2', 'from-secondary/20 to-secondary/5', '["تولید متن", "خلاصه‌سازی", "ترجمه و تحلیل"]', 2),
  ('آموزش‌های جامع', 'مقالات تخصصی، راهنمای پرامپت و آموزش‌های حرفه‌ای هوش مصنوعی', 'BookOpen', 'from-accent/20 to-accent/5', '["مقالات تخصصی", "راهنمای پرامپت", "آموزش حرفه‌ای"]', 3);

INSERT INTO public.homepage_tools (title, icon_name, color, link_url, display_order) VALUES
  ('چت‌بات', 'MessageCircle', 'primary', '/tools', 1),
  ('تولید متن', 'FileText', 'secondary', '/tools', 2),
  ('بازنویسی', 'Wand2', 'accent', '/tools', 3),
  ('ترجمه', 'Languages', 'primary', '/tools', 4),
  ('تولید تصویر', 'Image', 'secondary', '/tools', 5),
  ('کد نویسی', 'Code', 'accent', '/tools', 6),
  ('تحلیل مقاله', 'TrendingUp', 'primary', '/tools', 7),
  ('ساخت پرامپت', 'Sparkles', 'secondary', '/tools', 8);

INSERT INTO public.testimonials (name, role, content, rating, approved, display_order) VALUES
  ('علی محمدی', 'توسعه‌دهنده نرم‌افزار', 'نئوهوش کار من رو خیلی راحت‌تر کرده. از چت‌بات برای کدنویسی و حل مشکلات استفاده می‌کنم.', 5, true, 1),
  ('سارا احمدی', 'طراح گرافیک', 'ابزارهای تولید محتوا و تصویر فوق‌العادست! کیفیت خروجی‌ها حرفه‌ای و متنوعه.', 5, true, 2),
  ('رضا کریمی', 'بازاریاب دیجیتال', 'برای تولید محتوا و تحلیل داده‌ها از نئوهوش استفاده می‌کنم. واقعاً عالیه!', 5, true, 3);