export const exportSubtitle = (
  timestamps: Array<{ start: number; end: number; text: string }>,
  format: "srt" | "vtt",
  filename: string
) => {
  let content = "";

  if (format === "srt") {
    content = timestamps
      .map((item, index) => {
        return `${index + 1}\n${formatTimeSRT(item.start)} --> ${formatTimeSRT(item.end)}\n${item.text}\n`;
      })
      .join("\n");
  } else if (format === "vtt") {
    content = "WEBVTT\n\n" + timestamps
      .map((item, index) => {
        return `${index + 1}\n${formatTimeVTT(item.start)} --> ${formatTimeVTT(item.end)}\n${item.text}\n`;
      })
      .join("\n");
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatTimeSRT = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
};

const formatTimeVTT = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${pad(ms, 3)}`;
};

const pad = (num: number, size: number = 2): string => {
  return num.toString().padStart(size, "0");
};
