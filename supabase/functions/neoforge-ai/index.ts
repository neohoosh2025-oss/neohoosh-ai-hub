import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

// Professional project templates
const projectTemplates = {
  react: {
    name: 'React + Vite',
    files: ['src/App.tsx', 'src/main.tsx', 'src/index.css', 'index.html', 'vite.config.ts', 'package.json', 'tsconfig.json']
  },
  landing: {
    name: 'Landing Page',
    files: ['index.html', 'src/styles.css', 'src/main.js', 'src/components/Hero.js', 'src/components/Features.js', 'src/components/Footer.js']
  },
  dashboard: {
    name: 'Admin Dashboard',
    files: ['src/App.tsx', 'src/pages/Dashboard.tsx', 'src/pages/Settings.tsx', 'src/components/Sidebar.tsx', 'src/components/Header.tsx', 'src/components/Card.tsx']
  }
};

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
    const masterSystemPrompt = `You are NeoForge AI, a FULL-STACK autonomous AI software engineer. You can:
- Create complete projects from scratch
- Generate professional, production-grade UI/UX
- Write clean TypeScript/JavaScript code
- Create and manage file structures
- Implement best practices (SOLID, Clean Code)

🎯 CORE RULES:
1. ALWAYS return JSON with file operations
2. Generate COMPLETE, working code - no placeholders
3. Use modern patterns: TypeScript, functional components, hooks
4. CSS: Use modern CSS with CSS variables, flexbox/grid
5. NEVER explain unless asked - just produce code
6. Code must be pixel-perfect, professional quality

📁 OUTPUT FORMAT (STRICT):
{
  "operations": [
    { "type": "create_file", "path": "/src/Component.tsx", "content": "..." },
    { "type": "create_folder", "path": "/src/components" },
    { "type": "update_file", "path": "/src/App.tsx", "content": "..." },
    { "type": "delete_file", "path": "/src/old.js" }
  ],
  "summary": "Brief description of changes",
  "nextSteps": ["Optional suggestions for next actions"]
}

🎨 UI STANDARDS:
- Modern, minimal, pixel-perfect designs
- Inspired by: Vercel, Linear, Notion, Figma
- Smooth animations and transitions
- Professional color schemes
- Responsive by default
- Accessible (ARIA, semantic HTML)

💻 CODE STANDARDS:
- TypeScript strict mode when possible
- Functional components with hooks
- Clean separation of concerns
- Meaningful variable/function names
- No inline styles - use CSS classes
- Error handling included`;

    let userPrompt = '';
    let enhancedSystemPrompt = masterSystemPrompt;

    switch (action) {
      case 'scaffold':
        enhancedSystemPrompt += `\n\n🏗️ PROJECT SCAFFOLDING MODE:
You are creating a complete project from scratch. Generate ALL necessary files with FULL content.
Include: entry point, components, styles, config files, and proper folder structure.`;
        userPrompt = `Create a complete ${projectType || 'web'} project with the following requirements:

${prompt}

Generate a professional, production-ready project structure with all files fully implemented.
Return JSON with all file operations.`;
        break;

      case 'modify':
        enhancedSystemPrompt += `\n\n✏️ FILE MODIFICATION MODE:
Modify the existing file while maintaining its style and structure.
Return ONLY the updated file content in the operations array.`;
        userPrompt = `File: ${context?.fileName} (${context?.filePath})

Current content:
\`\`\`
${context?.fileContent || ''}
\`\`\`

Project files for context:
${allFiles}

Modification request: ${prompt}

Return JSON with the update_file operation containing the COMPLETE modified content.`;
        break;

      case 'create':
        enhancedSystemPrompt += `\n\n➕ FILE CREATION MODE:
Create new files based on the request. Determine appropriate filenames and paths.
Can create multiple related files if needed.`;
        userPrompt = `Project structure:
${allFiles}

Creation request: ${prompt}

Create the necessary file(s) with complete, working code. Return JSON with create_file operations.`;
        break;

      case 'explain':
        enhancedSystemPrompt = `You are a helpful coding tutor. Explain code clearly in the same language as the user's question (Persian if they write in Persian, English otherwise).`;
        userPrompt = `File: ${context?.fileName}

Code:
\`\`\`
${context?.fileContent || ''}
\`\`\`

Question: ${prompt}

Provide a clear, educational explanation.`;
        break;

      case 'refactor':
        enhancedSystemPrompt += `\n\n🔄 REFACTORING MODE:
Improve code quality, readability, and maintainability.
May split into multiple files if needed for better organization.`;
        userPrompt = `File: ${context?.fileName} (${context?.filePath})

Current code:
\`\`\`
${context?.fileContent || ''}
\`\`\`

Refactoring request: ${prompt}

Return JSON with file operations (may include multiple files if splitting is beneficial).`;
        break;

      case 'generate':
        enhancedSystemPrompt += `\n\n⚡ COMPONENT GENERATION MODE:
Generate professional, reusable components with proper styling.
Include TypeScript types if applicable.`;
        userPrompt = `Project context:
${allFiles}

Generate: ${prompt}

Create professional, production-ready component(s). Return JSON with create_file operations.`;
        break;

      case 'fix':
        enhancedSystemPrompt += `\n\n🔧 BUG FIX MODE:
Analyze the code and fix issues. Return corrected version.`;
        userPrompt = `File: ${context?.fileName}

Code with issue:
\`\`\`
${context?.fileContent || ''}
\`\`\`

Error/Issue: ${prompt}

Fix the issue and return JSON with the corrected file.`;
        break;

      case 'chat':
        enhancedSystemPrompt = `You are NeoForge AI assistant. Help with coding questions, architecture decisions, and best practices.
Respond in the same language as the user (Persian/English).
If code is needed, include it in your response.`;
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
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.',
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

    console.log('AI Response received, length:', aiResponse.length);

    // Parse the response
    let result: any = {};

    if (action === 'explain' || action === 'chat') {
      result = {
        type: 'explanation',
        content: aiResponse,
      };
    } else {
      // Try to parse as JSON for file operations
      try {
        // Extract JSON from response (might be wrapped in markdown)
        let jsonStr = aiResponse;
        const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        }
        
        // Try to find JSON object in the response
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
            summary: parsed.summary || 'Changes applied successfully!',
            nextSteps: parsed.nextSteps || [],
          };
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (parseError) {
        console.log('Could not parse as JSON, treating as code:', parseError);
        
        // Fallback: treat as single file update
        let code = aiResponse;
        code = code.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim();

        // Try to extract filename
        const filenameMatch = code.match(/\/\/\s*filename:\s*(.+)/i) || 
                             code.match(/\/\*\s*filename:\s*(.+)\*\//i);
        let fileName = context?.fileName || 'NewFile.js';
        
        if (filenameMatch) {
          fileName = filenameMatch[1].trim();
          code = code.replace(filenameMatch[0], '').trim();
        }

        const operationType = action === 'create' || action === 'generate' ? 'create_file' : 'update_file';
        const path = context?.filePath || `/src/${fileName}`;

        result = {
          type: 'operations',
          operations: [{
            type: operationType,
            path: path,
            content: code,
          }],
          summary: action === 'create' ? 'File created!' : 'File updated!',
          nextSteps: [],
        };
      }
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
