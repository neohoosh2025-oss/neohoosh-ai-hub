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
    const { action, prompt, context, allFiles } = await req.json();

    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Lovable-quality system prompt for beautiful code generation
    const masterSystemPrompt = `You are NeoForge AI, a PREMIUM code generator that creates STUNNING, PRODUCTION-READY web applications.

You generate code like Lovable.dev - beautiful, modern, and functional.

## CRITICAL: OUTPUT FORMAT
You MUST return ONLY valid JSON in this exact format:
{
  "operations": [
    { "type": "create_file", "path": "/index.html", "content": "..." },
    { "type": "create_file", "path": "/src/styles.css", "content": "..." },
    { "type": "create_file", "path": "/src/app.js", "content": "..." }
  ],
  "summary": "Created a beautiful landing page with hero section, features, and footer",
  "nextSteps": ["Add contact form", "Integrate animations"]
}

## FILE PATH RULES:
- HTML files: /index.html (root level)
- CSS files: /src/styles.css or /src/style.css
- JS files: /src/app.js or /src/main.js
- Always use forward slashes, paths start with /

## DESIGN REQUIREMENTS (MANDATORY):
1. **Color Scheme**: Use sophisticated dark themes
   - Background: #0a0a0f to #121218 gradients
   - Text: #ffffff, #e4e4e7, #a1a1aa
   - Accents: Purple (#8b5cf6, #a78bfa), Cyan (#22d3ee), or custom gradients
   
2. **Typography**:
   - Use system-ui, -apple-system, or 'Inter' font stack
   - Large hero headings (3rem-5rem) with gradient text
   - Proper hierarchy (h1 > h2 > h3 > p)
   
3. **Visual Effects**:
   - Glassmorphism: backdrop-filter: blur(10px); background: rgba(255,255,255,0.05)
   - Soft shadows: box-shadow with rgba values
   - Border radius: 12px-24px for cards
   - Subtle borders: 1px solid rgba(255,255,255,0.1)
   
4. **Animations**:
   - CSS @keyframes for fade-in, slide-up effects
   - Smooth transitions: transition: all 0.3s ease
   - Hover states with transforms and glows
   
5. **Layout**:
   - Flexbox and CSS Grid
   - Max-width containers (1200px) with centered content
   - Generous padding and spacing (2rem-4rem)
   - Responsive design with media queries

## EXAMPLE LANDING PAGE STRUCTURE:
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Name</title>
  <link rel="stylesheet" href="./src/styles.css">
</head>
<body>
  <nav class="navbar">...</nav>
  <section class="hero">...</section>
  <section class="features">...</section>
  <section class="cta">...</section>
  <footer>...</footer>
  <script src="./src/app.js"></script>
</body>
</html>
\`\`\`

## CSS TEMPLATE:
\`\`\`css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #121218;
  --bg-card: rgba(255,255,255,0.03);
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --accent: #8b5cf6;
  --accent-glow: rgba(139,92,246,0.4);
  --border: rgba(255,255,255,0.08);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

/* Glassmorphism card */
.card {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, var(--accent), #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Button with glow */
.btn-primary {
  background: linear-gradient(135deg, var(--accent), #7c3aed);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px var(--accent-glow);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px var(--accent-glow);
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fadeInUp 0.6s ease forwards; }
\`\`\`

## MUSIC PLAYER EXAMPLE:
When asked for a music player, create:
- Beautiful glass card with album art placeholder
- Progress bar with gradient
- Play/pause, skip buttons with icons (use HTML entities or SVG)
- Volume slider
- Track info display
- Hover effects on all buttons

## RULES:
1. Return ONLY the JSON object, no markdown code blocks
2. Escape all quotes and special characters in content strings
3. Create ALL necessary files (HTML, CSS, JS)
4. Make it BEAUTIFUL - this is your #1 priority
5. Include smooth animations and transitions
6. Use modern CSS features (grid, flexbox, custom properties)
7. Add interactive JavaScript for functionality`;

    let userPrompt = '';
    let isCodeAction = true;

    switch (action) {
      case 'scaffold':
        userPrompt = `Create a complete, beautiful project for: "${prompt}"

Include:
1. index.html with semantic HTML5 structure
2. /src/styles.css with modern CSS (variables, animations, responsive)
3. /src/app.js with interactive JavaScript

Make it STUNNING - use gradients, glassmorphism, animations.
Return the JSON with all file operations.`;
        break;
        
      case 'modify':
        userPrompt = `Current file ${context?.fileName}:
\`\`\`
${context?.fileContent}
\`\`\`

User request: ${prompt}

Update the file and return JSON with the update_file operation.
Make any improvements beautiful and maintain the existing design language.`;
        break;
        
      case 'generate':
        userPrompt = `Generate a beautiful component/feature: "${prompt}"

Create all necessary files and make it visually stunning.
Return JSON with create_file operations for each file.`;
        break;
        
      case 'fix':
        userPrompt = `There's an error in the code. Here's the context:

${prompt}

Current files:
${allFiles}

Analyze the error and fix it. Return JSON with the corrected file(s).
Make sure the fix is complete and the code is beautiful.`;
        break;
        
      case 'chat':
      case 'explain':
        isCodeAction = false;
        userPrompt = prompt;
        break;
        
      default:
        userPrompt = `${prompt}\n\nReturn beautiful, production-ready code as JSON with file operations.`;
    }

    console.log(`NeoForge AI - Action: ${action}, Prompt length: ${userPrompt.length}`);

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
          { role: 'system', content: isCodeAction ? masterSystemPrompt : 'You are a helpful coding assistant. Be concise and helpful.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit reached. Please wait a moment and try again.',
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

    let result: any = {};

    if (!isCodeAction) {
      result = { type: 'explanation', content: aiResponse };
    } else {
      try {
        // Extract JSON from response
        let jsonStr = aiResponse;
        
        // Remove markdown code blocks if present
        const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        }
        
        // Find the JSON object
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }

        // Clean up common issues
        jsonStr = jsonStr
          .replace(/\r\n/g, '\\n')
          .replace(/\t/g, '  ');

        const parsed = JSON.parse(jsonStr);
        
        if (parsed.operations && Array.isArray(parsed.operations) && parsed.operations.length > 0) {
          // Normalize file paths
          const normalizedOps = parsed.operations.map((op: any) => ({
            ...op,
            path: op.path.startsWith('/') ? op.path : '/' + op.path,
            content: op.content || '',
          }));

          result = {
            type: 'operations',
            operations: normalizedOps,
            summary: parsed.summary || `✅ Created ${normalizedOps.length} file(s)`,
            nextSteps: parsed.nextSteps || [],
          };
          
          console.log('Parsed operations:', normalizedOps.map((o: any) => o.path));
        } else {
          throw new Error('No valid operations found');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Raw response:', aiResponse.substring(0, 500));
        
        // Fallback: create a simple landing page
        const fallbackHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="./src/styles.css">
</head>
<body>
  <div class="container">
    <section class="hero">
      <h1 class="gradient-text">Welcome</h1>
      <p>Your beautiful project starts here</p>
      <button class="btn-primary">Get Started</button>
    </section>
  </div>
  <script src="./src/app.js"></script>
</body>
</html>`;

        const fallbackCSS = `:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #121218;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --accent: #8b5cf6;
  --accent-glow: rgba(139,92,246,0.4);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  color: var(--text-primary);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.5rem;
}

.hero h1 {
  font-size: 4rem;
  font-weight: 800;
}

.gradient-text {
  background: linear-gradient(135deg, var(--accent), #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent), #7c3aed);
  color: white;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px var(--accent-glow);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px var(--accent-glow);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero > * {
  animation: fadeInUp 0.6s ease forwards;
}

.hero > *:nth-child(2) { animation-delay: 0.1s; }
.hero > *:nth-child(3) { animation-delay: 0.2s; }`;

        const fallbackJS = `// App JavaScript
console.log('🚀 App loaded!');

document.querySelector('.btn-primary')?.addEventListener('click', () => {
  alert('Welcome to your new project!');
});`;

        result = {
          type: 'operations',
          operations: [
            { type: 'create_file', path: '/index.html', content: fallbackHTML },
            { type: 'create_file', path: '/src/styles.css', content: fallbackCSS },
            { type: 'create_file', path: '/src/app.js', content: fallbackJS },
          ],
          summary: '✅ Created a beautiful landing page',
          nextSteps: ['Customize the content', 'Add more sections'],
        };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('NeoForge error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        type: 'error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
