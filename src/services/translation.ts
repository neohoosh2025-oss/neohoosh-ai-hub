const OPENROUTER_API_KEY = "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";
const TRANSLATION_MODEL = "x-ai/grok-4-fast";

export const translateSubtitle = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  const languageNames: Record<string, string> = {
    fa: "Persian (Farsi)",
    en: "English",
    ar: "Arabic",
    fr: "French",
    de: "German",
    es: "Spanish",
  };

  const prompt = `Translate the following subtitle text to ${languageNames[targetLanguage] || targetLanguage}. 
Maintain the subtitle format with timestamps. Provide natural, fluent translation:

${text}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "NeoFlux Translation",
    },
    body: JSON.stringify({
      model: TRANSLATION_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional subtitle translator. Translate subtitles while maintaining timing and format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error("خطا در ترجمه متن");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || text;
};
