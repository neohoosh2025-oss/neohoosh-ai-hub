import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, prompt, context, allFiles } = await req.json();

    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    // Build system prompt based on action
    let systemPrompt = `You are NeoForge AI, an expert code assistant. You help developers write, modify, and understand code.

IMPORTANT RULES:
1. When generating or modifying code, return ONLY the code without markdown code blocks unless asked for explanation
2. Be concise and precise
3. Follow best practices for the language being used
4. Maintain consistent code style`;

    let userPrompt = '';

    switch (action) {
      case 'modify':
        systemPrompt += `\n\nYou are modifying an existing file. Return the COMPLETE modified file content.`;
        userPrompt = `Current file: ${context?.fileName || 'Unknown'}
Path: ${context?.filePath || 'Unknown'}

Current content:
\`\`\`
${context?.fileContent || ''}
\`\`\`

User request: ${prompt}

Return the complete modified file content. Only return the code, no explanations unless specifically asked.`;
        break;

      case 'create':
        systemPrompt += `\n\nYou are creating a new file. Return ONLY the file content.`;
        userPrompt = `Project files for context:
${allFiles}

User request: ${prompt}

Create a new file based on the request. First line should be a comment with the suggested filename (e.g., // filename: Component.jsx), then the actual code.`;
        break;

      case 'explain':
        systemPrompt += `\n\nYou are explaining code. Be clear and educational.`;
        userPrompt = `File: ${context?.fileName || 'Unknown'}

Code:
\`\`\`
${context?.fileContent || ''}
\`\`\`

User question: ${prompt}

Provide a clear explanation in Persian (Farsi) if the user writes in Persian, otherwise in English.`;
        break;

      case 'refactor':
        systemPrompt += `\n\nYou are refactoring code. Improve structure, readability, and performance while maintaining functionality.`;
        userPrompt = `File: ${context?.fileName || 'Unknown'}

Current code:
\`\`\`
${context?.fileContent || ''}
\`\`\`

Refactoring request: ${prompt}

Return the complete refactored file. Only return the code.`;
        break;

      case 'generate':
        systemPrompt += `\n\nYou are generating a new component or feature. Return complete, working code.`;
        userPrompt = `Project context:
${allFiles}

Generation request: ${prompt}

Generate the requested component/feature. First line should be a comment with the suggested filename, then the code.`;
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
        'X-Title': 'NeoForge Code Playground',
      },
      body: JSON.stringify({
        model: 'tngtech/deepseek-r1t-chimera:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    console.log('AI Response received, length:', aiResponse.length);

    // Parse the response based on action
    let result: any = {};

    if (action === 'explain') {
      result = {
        type: 'explanation',
        content: aiResponse,
      };
    } else if (action === 'create' || action === 'generate') {
      // Try to extract filename from first line comment
      const lines = aiResponse.split('\n');
      let fileName = 'NewFile.js';
      let code = aiResponse;

      const filenameMatch = lines[0].match(/filename:\s*(.+)/i);
      if (filenameMatch) {
        fileName = filenameMatch[1].trim();
        code = lines.slice(1).join('\n').trim();
      }

      // Remove markdown code blocks if present
      code = code.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim();

      result = {
        type: 'code',
        fileName,
        code,
        explanation: 'File created successfully!',
      };
    } else {
      // modify or refactor
      let code = aiResponse;
      
      // Remove markdown code blocks if present
      code = code.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim();

      result = {
        type: 'code',
        code,
        explanation: action === 'refactor' ? 'Code refactored!' : 'File modified!',
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('NeoForge AI error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
