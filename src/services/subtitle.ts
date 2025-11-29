const SUBTITLE_API_KEY = "bd55c205deb84668a68bf2efa6309205";
const SUBTITLE_API_URL = "https://api.assemblyai.com/v2";

export const generateSubtitles = async (video: any) => {
  // Step 1: Upload audio file
  const audioUrl = await uploadAudio(video);
  
  // Step 2: Request transcription
  const transcriptId = await requestTranscription(audioUrl);
  
  // Step 3: Poll for completion
  const transcript = await pollTranscription(transcriptId);
  
  // Step 4: Format as subtitle
  return formatSubtitle(transcript);
};

const uploadAudio = async (video: any): Promise<string> => {
  if (video.file) {
    // Upload local file
    const response = await fetch(`${SUBTITLE_API_URL}/upload`, {
      method: "POST",
      headers: {
        "authorization": SUBTITLE_API_KEY,
      },
      body: video.file,
    });

    if (!response.ok) {
      throw new Error("خطا در آپلود فایل صوتی");
    }

    const data = await response.json();
    return data.upload_url;
  } else if (video.url) {
    // For YouTube videos, we'd need to extract audio
    // This is simplified - in production you'd need a service to extract audio
    throw new Error("برای ویدیوهای یوتیوب باید ابتدا صدا استخراج شود");
  }

  throw new Error("فایل صوتی معتبر نیست");
};

const requestTranscription = async (audioUrl: string): Promise<string> => {
  const response = await fetch(`${SUBTITLE_API_URL}/transcript`, {
    method: "POST",
    headers: {
      "authorization": SUBTITLE_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      language_detection: true,
    }),
  });

  if (!response.ok) {
    throw new Error("خطا در درخواست رونویسی");
  }

  const data = await response.json();
  return data.id;
};

const pollTranscription = async (transcriptId: string): Promise<any> => {
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`${SUBTITLE_API_URL}/transcript/${transcriptId}`, {
      headers: {
        "authorization": SUBTITLE_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error("خطا در دریافت وضعیت رونویسی");
    }

    const data = await response.json();

    if (data.status === "completed") {
      return data;
    } else if (data.status === "error") {
      throw new Error("خطا در پردازش رونویسی");
    }

    // Wait 3 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 3000));
    attempts++;
  }

  throw new Error("زمان پردازش به پایان رسید");
};

const formatSubtitle = (transcript: any) => {
  const timestamps = transcript.words?.map((word: any, index: number) => ({
    start: word.start / 1000, // Convert to seconds
    end: word.end / 1000,
    text: word.text,
  })) || [];

  // Group words into subtitle lines (max 10 words per line)
  const lines: Array<{ start: number; end: number; text: string }> = [];
  for (let i = 0; i < timestamps.length; i += 10) {
    const chunk = timestamps.slice(i, i + 10);
    if (chunk.length > 0) {
      lines.push({
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end,
        text: chunk.map((w: any) => w.text).join(" "),
      });
    }
  }

  // Format as SRT
  const formatted = lines
    .map((line, index) => {
      return `${index + 1}\n${formatTime(line.start)} --> ${formatTime(line.end)}\n${line.text}\n`;
    })
    .join("\n");

  return {
    raw: transcript.text,
    formatted,
    timestamps: lines,
  };
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
};

const pad = (num: number, size: number = 2): string => {
  return num.toString().padStart(size, "0");
};
