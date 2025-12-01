import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Play, Trash2, Phone, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MobileOptimized, MobileContainer } from '@/components/MobileOptimized';

interface VoiceCall {
  id: string;
  duration: number;
  voice_type: string;
  audio_url: string | null;
  transcript: string | null;
  created_at: string;
}

const VoiceCallHistory = () => {
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('voice_calls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
      toast({
        title: 'خطا در دریافت تماس‌ها',
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (call: VoiceCall) => {
    if (!call.audio_url) {
      toast({
        title: 'فایل صوتی موجود نیست',
        variant: 'destructive',
      });
      return;
    }

    if (playingId === call.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = call.audio_url;
        audioRef.current.play();
        setPlayingId(call.id);
      }
    }
  };

  const handleDownload = async (call: VoiceCall) => {
    if (!call.audio_url) return;

    try {
      const response = await fetch(call.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-call-${call.id}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: '✅ دانلود موفق',
        description: 'فایل صوتی دانلود شد',
      });
    } catch (error) {
      toast({
        title: 'خطا در دانلود',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('voice_calls')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCalls(calls.filter(c => c.id !== id));
      toast({
        title: '✅ حذف شد',
        description: 'تماس با موفقیت حذف شد',
      });
    } catch (error) {
      toast({
        title: 'خطا در حذف',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <MobileOptimized className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Phone className="w-12 h-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </MobileOptimized>
    );
  }

  return (
    <MobileOptimized className="min-h-screen">
      <MobileContainer>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">تاریخچه تماس‌ها</h1>
            <p className="text-muted-foreground">تماس‌های صوتی شما با AI</p>
          </div>

          {calls.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Phone className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  هنوز تماسی ثبت نشده است
                  <br />
                  اولین تماس صوتی خود را با AI شروع کنید
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {calls.map((call, index) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary" />
                            تماس صوتی
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs">
                            <Calendar className="w-3 h-3" />
                            {formatDate(call.created_at)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-primary">
                            {formatDuration(call.duration)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">صدای AI:</span>
                        <span className="font-semibold capitalize">{call.voice_type}</span>
                      </div>

                      {call.transcript && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-right line-clamp-3">{call.transcript}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {call.audio_url && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePlay(call)}
                              className="flex-1 gap-2"
                            >
                              <Play className={`w-4 h-4 ${playingId === call.id ? 'text-primary' : ''}`} />
                              {playingId === call.id ? 'توقف' : 'پخش'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(call)}
                              className="flex-1 gap-2"
                            >
                              <Download className="w-4 h-4" />
                              دانلود
                            </Button>
                          </>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(call.id)}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </MobileContainer>

      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        onPause={() => setPlayingId(null)}
      />
    </MobileOptimized>
  );
};

export default VoiceCallHistory;
