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
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[image:var(--gradient-mesh)] opacity-40"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="shadow-glow"><Sparkles className="w-4 h-4 ml-2" />تماس با ما</Badge>
            <h1 className="text-4xl md:text-6xl font-bold font-display">با <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">تیم نئوهوش</span><br />در ارتباط باشید</h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-3xl font-display">فرم تماس</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>نام *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={errors.name ? "border-destructive" : ""} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>ایمیل *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={errors.email ? "border-destructive" : ""} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>پیام *</Label>
                    <Textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={6} className={errors.message ? "border-destructive" : ""} />
                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                  </div>
                  <Button type="submit" size="lg" className="w-full shadow-glow" disabled={isSubmitting}>
                    {isSubmitting ? "در حال ارسال..." : <><Send className="ml-2" />ارسال پیام</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card><CardContent className="p-6 flex items-center gap-4"><Mail className="w-6 h-6 text-primary" /><div><h3 className="font-semibold">ایمیل</h3><a href="mailto:neohoosh.2025@gmail.com" className="text-muted-foreground hover:text-primary">neohoosh.2025@gmail.com</a></div></CardContent></Card>
              <Card><CardContent className="p-6 flex items-center gap-4"><Instagram className="w-6 h-6 text-primary" /><div><h3 className="font-semibold">اینستاگرام</h3><a href="https://instagram.com/neohoosh.ai" target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary">@neohoosh.ai</a></div></CardContent></Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
