import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, MessageCircle, Sparkles, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { MainLayout } from "@/components/layouts/MainLayout";

const contactSchema = z.object({
  name: z.string().trim().min(2, "نام باید حداقل 2 کاراکتر باشد").max(100),
  email: z.string().trim().email("ایمیل معتبر نیست").max(255),
  message: z.string().trim().min(10, "پیام باید حداقل 10 کاراکتر باشد").max(2000),
});

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      contactSchema.parse(formData);
      setIsSubmitting(true);
      const { error } = await supabase.from("comments").insert(formData);
      if (error) throw error;
      toast({ title: "پیام ارسال شد!", description: "به زودی پاسخ خواهیم داد." });
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => { if (err.path[0]) newErrors[err.path[0] as string] = err.message; });
        setErrors(newErrors);
      }
      toast({ title: "خطا", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="pb-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
          <div className="container mx-auto px-4 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="max-w-2xl mx-auto text-center space-y-4"
            >
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                تماس با ما
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold">
                با{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  تیم نئوهوش
                </span>
                {" "}در ارتباط باشید
              </h1>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="px-4">
          <div className="max-w-lg mx-auto space-y-4">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">فرم تماس</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">نام *</Label>
                      <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        className={errors.name ? "border-destructive" : ""} 
                        placeholder="نام خود را وارد کنید"
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">ایمیل *</Label>
                      <Input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        className={errors.email ? "border-destructive" : ""} 
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">پیام *</Label>
                      <Textarea 
                        value={formData.message} 
                        onChange={(e) => setFormData({...formData, message: e.target.value})} 
                        rows={4} 
                        className={errors.message ? "border-destructive" : ""} 
                        placeholder="پیام خود را بنویسید..."
                      />
                      {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          در حال ارسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          ارسال پیام
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <Card className="border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm">ایمیل</h3>
                    <a 
                      href="mailto:neohoosh.2025@gmail.com" 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors truncate block"
                      dir="ltr"
                    >
                      neohoosh.2025@gmail.com
                    </a>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5 text-pink-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm">اینستاگرام</h3>
                    <a 
                      href="https://instagram.com/neohoosh.ai" 
                      target="_blank" 
                      rel="noopener" 
                      className="text-sm text-muted-foreground hover:text-pink-500 transition-colors"
                      dir="ltr"
                    >
                      @neohoosh.ai
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Contact;
