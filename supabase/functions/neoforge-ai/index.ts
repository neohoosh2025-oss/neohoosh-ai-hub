import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, prompt, context, allFiles, projectType } = await req.json();

    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Master system prompt for autonomous AI builder
    const masterSystemPrompt = `You are NeoForge AI, an autonomous code generator. Return ONLY valid JSON.

OUTPUT FORMAT (REQUIRED):
{
  "operations": [
    { "type": "create_file", "path": "/src/file.js", "content": "code here" }
  ],
  "summary": "Brief description",
  "nextSteps": []
}

RULES:
- ALWAYS return valid JSON with operations array
- Generate complete, working code
- Use modern CSS (flexbox, grid, variables)
- No explanations, just JSON output`;

    let userPrompt = '';
    let enhancedSystemPrompt = masterSystemPrompt;

    switch (action) {
      case 'scaffold':
        userPrompt = `Create project: ${prompt}\nReturn JSON with file operations.`;
        break;
      case 'modify':
        userPrompt = `Modify ${context?.fileName}:\n${context?.fileContent}\n\nRequest: ${prompt}\nReturn JSON.`;
        break;
      case 'generate':
        userPrompt = `Generate: ${prompt}\nReturn JSON with create_file operations.`;
        break;
      case 'explain':
      case 'chat':
        enhancedSystemPrompt = `You are a helpful coding assistant. Respond in the same language as the user.`;
        userPrompt = prompt;
        break;
      default:
        userPrompt = prompt;
    }

    console.log(`NeoForge AI - Action: ${action}`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://neohoosh.com',
        'X-Title': 'NeoForge AI'
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it:free',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit. Please wait and try again.',
          type: 'error'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    console.log('AI Response length:', aiResponse.length);

    let result: any = {};

    if (action === 'explain' || action === 'chat') {
      result = { type: 'explanation', content: aiResponse };
    } else {
      try {
        let jsonStr = aiResponse;
        const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1];
        
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }

        const parsed = JSON.parse(jsonStr);
        
        if (parsed.operations && Array.isArray(parsed.operations)) {
          result = {
            type: 'operations',
            operations: parsed.operations,
            summary: parsed.summary || 'Done!',
            nextSteps: parsed.nextSteps || [],
          };
        } else {
          throw new Error('No operations array');
        }
      } catch (parseError) {
        console.log('Parse error, using fallback:', parseError);
        
        let code = aiResponse.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim();
        const path = context?.filePath || '/src/index.html';

        result = {
          type: 'operations',
          operations: [{ type: 'create_file', path, content: code }],
          summary: 'File created!',
          nextSteps: [],
        };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('NeoForge error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error', type: 'error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
