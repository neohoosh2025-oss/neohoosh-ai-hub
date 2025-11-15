import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Send, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("comments").insert({
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });

    if (error) {
      toast({
        title: t("contact.error"),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("contact.success"),
        description: t("contact.successDesc"),
      });
      setFormData({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t("contact.title")}
          </h1>
            <p className="text-lg text-muted-foreground">
              {t("contact.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Form */}
            <Card className="p-8 border-border">
              <h2 className="text-2xl font-bold mb-6">{t("contact.formTitle")}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("contact.name")}
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={t("contact.namePlaceholder")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("contact.email")}
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("contact.message")}
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={t("contact.messagePlaceholder")}
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gap-2 glow-neon">
                  <Send className="h-4 w-4" />
                  {t("contact.send")}
                </Button>
              </form>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6 border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-neon">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">ایمیل</h3>
                    <a
                      href="mailto:neohoosh.2025@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      neohoosh.2025@gmail.com
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-neon">
                    <Instagram className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">اینستاگرام</h3>
                    <a
                      href="https://www.instagram.com/neohoosh.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      @neohoosh.ai
                    </a>
                  </div>
                </div>
              </Card>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <h3 className="font-semibold mb-2">زمان پاسخگویی</h3>
                <p className="text-sm text-muted-foreground">
                  ما معمولاً ظرف ۲۴ ساعت به پیام‌ها پاسخ می‌دهیم.
                  برای پشتیبانی سریع‌تر می‌توانید از طریق اینستاگرام با ما در ارتباط باشید.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
