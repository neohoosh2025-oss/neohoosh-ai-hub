import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface RecordingData {
  chunks: Blob[];
  startTime: number;
}

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const recordingDataRef = useRef<RecordingData>({ chunks: [], startTime: 0 });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async (voiceType: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      recordingDataRef.current = {
        chunks: [],
        startTime: Date.now(),
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingDataRef.current.chunks.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Record in 1-second chunks
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Create database entry
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('voice_calls')
        .insert({
          user_id: user.id,
          voice_type: voiceType,
          duration: 0,
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentCallId(data.id);

      console.log('Recording started, call ID:', data.id);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'خطا در شروع ضبط',
        description: error instanceof Error ? error.message : 'لطفاً دوباره تلاش کنید',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async (transcript?: string) => {
    if (!mediaRecorderRef.current || !currentCallId) return;

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      
      mediaRecorder.onstop = async () => {
        try {
          const duration = Math.floor((Date.now() - recordingDataRef.current.startTime) / 1000);
          const audioBlob = new Blob(recordingDataRef.current.chunks, { type: 'audio/webm' });

          // Upload to storage
          const fileName = `${currentCallId}_${Date.now()}.webm`;
          const { error: uploadError } = await supabase.storage
            .from('neohi-voice')
            .upload(`recordings/${fileName}`, audioBlob);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('neohi-voice')
            .getPublicUrl(`recordings/${fileName}`);

          // Update database
          const { error: updateError } = await supabase
            .from('voice_calls')
            .update({
              duration,
              audio_url: publicUrl,
              transcript: transcript || '',
            })
            .eq('id', currentCallId);

          if (updateError) throw updateError;

          console.log('Recording saved successfully:', currentCallId);
          
          toast({
            title: '✅ تماس ذخیره شد',
            description: `تماس ${duration} ثانیه‌ای با موفقیت ذخیره شد`,
          });
        } catch (error) {
          console.error('Error saving recording:', error);
          toast({
            title: 'خطا در ذخیره‌سازی',
            description: 'تماس ضبط شد اما ذخیره نشد',
            variant: 'destructive',
          });
        } finally {
          // Cleanup
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
          setCurrentCallId(null);
          recordingDataRef.current = { chunks: [], startTime: 0 };
          mediaRecorderRef.current = null;
          resolve();
        }
      };

      mediaRecorder.stop();
    });
  }, [currentCallId, toast]);

  return {
    isRecording,
    currentCallId,
    startRecording,
    stopRecording,
  };
};
