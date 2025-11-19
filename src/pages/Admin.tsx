import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminArticles } from "./AdminArticles";
import { AdminProducts } from "./AdminProducts";
import { AdminComments } from "./AdminComments";
import { LogOut, Languages } from "lucide-react";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== "admin") {
      toast({
        title: "دسترسی غیرمجاز",
        description: "شما دسترسی به پنل مدیریت ندارید",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">پنل مدیریت</h1>
          <div className="flex gap-2">
            <Link to="/admin/translate">
              <Button variant="default" className="gap-2">
                <Languages className="h-4 w-4" />
                ترجمه خودکار مقالات
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>

        <Tabs defaultValue="articles" dir="rtl">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="articles">مقالات</TabsTrigger>
            <TabsTrigger value="products">محصولات</TabsTrigger>
            <TabsTrigger value="comments">نظرات</TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <AdminArticles />
          </TabsContent>

          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="comments">
            <AdminComments />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
