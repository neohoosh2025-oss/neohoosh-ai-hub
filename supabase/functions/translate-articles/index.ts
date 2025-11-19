import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get all articles
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("id, title, excerpt, content");

    if (articlesError) throw articlesError;

    console.log(`Found ${articles.length} articles to translate`);

    const results = [];

    for (const article of articles) {
      // Check if translations already exist
      const { data: existing } = await supabase
        .from("article_translations")
        .select("language")
        .eq("article_id", article.id);

      const existingLangs = existing?.map(t => t.language) || [];
      const langsToTranslate = ["en", "ar"].filter(lang => !existingLangs.includes(lang));

      if (langsToTranslate.length === 0) {
        results.push({ article_id: article.id, status: "already_translated" });
        continue;
      }

      // Translate to each missing language
      for (const targetLang of langsToTranslate) {
        const langName = targetLang === "en" ? "English" : "Arabic";
        
        const prompt = `Translate the following Persian article to ${langName}. Return ONLY a JSON object with these exact keys: "title", "excerpt", "content". Do not add any extra text or explanation.

Title: ${article.title}
Excerpt: ${article.excerpt}
Content: ${article.content}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: "You are a professional translator. Always respond with valid JSON only, no extra text."
              },
              {
                role: "user",
                content: prompt
              }
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Translation API error for ${langName}:`, response.status, errorText);
          results.push({ 
            article_id: article.id, 
            language: targetLang, 
            status: "error", 
            error: `API error: ${response.status}` 
          });
          continue;
        }

        const data = await response.json();
        const translatedText = data.choices?.[0]?.message?.content;

        if (!translatedText) {
          console.error("No translation received");
          results.push({ 
            article_id: article.id, 
            language: targetLang, 
            status: "error", 
            error: "No translation received" 
          });
          continue;
        }

        // Parse the JSON response
        let translation;
        try {
          // Try to extract JSON if there's extra text
          const jsonMatch = translatedText.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : translatedText;
          translation = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse translation JSON:", e);
          results.push({ 
            article_id: article.id, 
            language: targetLang, 
            status: "error", 
            error: "Failed to parse translation" 
          });
          continue;
        }

        // Save translation to database
        const { error: insertError } = await supabase
          .from("article_translations")
          .insert({
            article_id: article.id,
            language: targetLang,
            title: translation.title,
            excerpt: translation.excerpt,
            content: translation.content,
          });

        if (insertError) {
          console.error("Error saving translation:", insertError);
          results.push({ 
            article_id: article.id, 
            language: targetLang, 
            status: "error", 
            error: insertError.message 
          });
        } else {
          results.push({ 
            article_id: article.id, 
            language: targetLang, 
            status: "success" 
          });
        }

        // Small delay between translations to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        total_articles: articles.length,
        results 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in translate-articles:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});