import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Send, CheckCircle } from "lucide-react";

interface Comment {
  id: string;
  name: string;
  email: string;
  message: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
  approved: boolean;
}

export const AdminComments = () => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری نظرات",
        variant: "destructive",
      });
    } else {
      setComments(data || []);
    }
  };

  const handleReply = async (commentId: string) => {
    const reply = replyText[commentId];
    if (!reply) return;

    const { error } = await supabase
      .from("comments")
      .update({
        reply,
        replied_at: new Date().toISOString(),
      })
      .eq("id", commentId);

    if (error) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفق",
        description: "پاسخ ثبت شد",
      });
      setReplyText({ ...replyText, [commentId]: "" });
      fetchComments();
    }
  };

  const handleApprove = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .update({ approved: true })
      .eq("id", commentId);

    if (error) {
      toast({
        title: "خطا",
        description: "تایید نظر انجام نشد",
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفق",
        description: "نظر تایید شد و در صفحه اصلی نمایش داده می‌شود",
      });
      fetchComments();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفق",
        description: "نظر حذف شد",
      });
      fetchComments();
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">مدیریت نظرات ({comments.length})</h2>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold">{comment.name}</h3>
                    <span className="text-sm text-muted-foreground">{comment.email}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        comment.approved
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}
                    >
                      {comment.approved ? "تایید شده" : "در انتظار تایید"}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-2">{comment.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString("fa-IR")}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(comment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {comment.reply && (
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-1">پاسخ شما:</p>
                  <p className="text-sm">{comment.reply}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {comment.replied_at && new Date(comment.replied_at).toLocaleDateString("fa-IR")}
                  </p>
                </div>
              )}

              {!comment.reply && (
                <div className="space-y-2">
                  <Label htmlFor={`reply-${comment.id}`}>پاسخ</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id={`reply-${comment.id}`}
                      value={replyText[comment.id] || ""}
                      onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                      placeholder="پاسخ خود را بنویسید..."
                      rows={3}
                    />
                    <Button
                      onClick={() => handleReply(comment.id)}
                      disabled={!replyText[comment.id]}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {!comment.approved && (
                <Button
                  onClick={() => handleApprove(comment.id)}
                  className="w-full gap-2"
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4" />
                  تایید و انتشار در صفحه اصلی
                </Button>
              )}
            </div>
          </Card>
        ))}

        {comments.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">هنوز نظری ثبت نشده است</p>
          </Card>
        )}
      </div>
    </div>
  );
};
