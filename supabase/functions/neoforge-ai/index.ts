import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use OpenRouter free models
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Cache helper for similar prompts
async function getCachedResponse(supabase: any, promptHash: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('api_cache')
      .select('cache_value, hits')
      .eq('cache_key', `neoforge:${promptHash}`)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;

    // Update hit count
    supabase.from('api_cache').update({ hits: ((data as any).hits || 0) + 1 }).eq('cache_key', `neoforge:${promptHash}`).then(() => {});
    
    console.log(`[NeoForge Cache] Hit for prompt hash: ${promptHash}`);
    return (data as any).cache_value;
  } catch {
    return null;
  }
}

async function setCachedResponse(supabase: any, promptHash: string, response: any, ttlSeconds: number = 3600): Promise<void> {
  try {
    await supabase.from('api_cache').upsert({
      cache_key: `neoforge:${promptHash}`,
      cache_value: response,
      expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      hits: 0,
    }, { onConflict: 'cache_key' });
    console.log(`[NeoForge Cache] Stored response for: ${promptHash}`);
  } catch (e) {
    console.error('[NeoForge Cache] Error:', e);
  }
}

// Simple hash function for prompt deduplication
function hashPrompt(action: string, prompt: string): string {
  const str = `${action}:${prompt.toLowerCase().trim().slice(0, 200)}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, prompt, context, allFiles } = await req.json();

    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Initialize Supabase for caching
    let supabase = null;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    // Check cache for scaffold actions (these are more likely to be similar)
    if (supabase && action === 'scaffold') {
      const promptHash = hashPrompt(action, prompt);
      const cachedResponse = await getCachedResponse(supabase, promptHash);
      
      if (cachedResponse) {
        console.log('[NeoForge] Returning cached scaffold response');
        return new Response(JSON.stringify(cachedResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Premium system prompt for Lovable-quality code generation
    const masterSystemPrompt = `You are NeoForge AI, an ELITE code generator that creates STUNNING, PRODUCTION-READY web applications like Lovable.dev.

## YOUR MISSION
Generate the most BEAUTIFUL, MODERN, and IMPRESSIVE code possible. Every project you create should WOW users and make them excited to use NeoForge.

## CRITICAL: OUTPUT FORMAT
Return ONLY valid JSON - no markdown, no explanation outside JSON:
{
  "operations": [
    { "type": "create_file", "path": "/index.html", "content": "..." },
    { "type": "create_file", "path": "/src/styles.css", "content": "..." },
    { "type": "create_file", "path": "/src/app.js", "content": "..." }
  ],
  "summary": "Created a stunning [description]",
  "nextSteps": ["Suggestion 1", "Suggestion 2"]
}

## FILE PATH RULES:
- HTML: /index.html
- CSS: /src/styles.css
- JS: /src/app.js
- Always start paths with /

## DESIGN PHILOSOPHY (MANDATORY):

### 1. COLOR PALETTE - Dark Luxury Theme
\`\`\`css
--bg-deep: #050508;
--bg-primary: #0a0a0f;
--bg-elevated: #111116;
--bg-card: rgba(255,255,255,0.02);
--bg-glass: rgba(255,255,255,0.04);

--text-primary: #fafafa;
--text-secondary: #a1a1aa;
--text-muted: #71717a;

--accent-purple: #8b5cf6;
--accent-violet: #a78bfa;
--accent-cyan: #22d3ee;
--accent-pink: #ec4899;
--accent-emerald: #34d399;

--gradient-hero: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #22d3ee 100%);
--gradient-button: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
--gradient-card: linear-gradient(145deg, rgba(139,92,246,0.1), rgba(34,211,238,0.05));
\`\`\`

### 2. GLASSMORPHISM - Always Use
\`\`\`css
.glass {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.05);
}
\`\`\`

### 3. TYPOGRAPHY - Modern & Bold
- Font: system-ui, -apple-system, 'Inter', sans-serif
- Hero titles: 4rem-6rem, font-weight 800, gradient text
- Subheadings: 1.5rem-2rem, font-weight 600
- Body: 1rem, line-height 1.7, font-weight 400

### 4. ANIMATIONS - Smooth & Elegant
\`\`\`css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
  50% { box-shadow: 0 0 40px rgba(139,92,246,0.6); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
\`\`\`

### 5. BUTTONS - Premium Feel
\`\`\`css
.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 25px rgba(139,92,246,0.35);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 40px rgba(139,92,246,0.5);
}

.btn-primary:hover::before { left: 100%; }
\`\`\`

### 6. CARDS - Depth & Glass
\`\`\`css
.card {
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 2.5rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(145deg, rgba(139,92,246,0.2), transparent, rgba(34,211,238,0.1));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 60px rgba(0,0,0,0.4);
  border-color: rgba(139,92,246,0.2);
}
\`\`\`

### 7. LAYOUT - Spacious & Centered
- Max-width: 1280px with auto margins
- Generous padding: 2rem-4rem
- CSS Grid for complex layouts
- Flexbox for alignment
- Gap: 2rem-4rem between sections

### 8. RESPONSIVE - Mobile-First
\`\`\`css
@media (max-width: 768px) {
  .hero h1 { font-size: 2.5rem; }
  .container { padding: 0 1.5rem; }
  .card { padding: 1.5rem; }
}
\`\`\`

## EXAMPLE PROJECTS:

### Music Player
- Album art with animated glow ring
- Gradient progress bar with time markers
- Frosted glass control buttons
- Animated equalizer bars
- Floating album art with shadow

### Landing Page
- Animated gradient hero with floating elements
- Glass navbar with blur effect
- Feature cards with hover animations
- Testimonials carousel
- Newsletter signup with glow effect
- Footer with social icons

### Dashboard
- Sidebar with icons and active states
- Stat cards with animated counters
- Charts with gradient fills
- Data tables with hover rows
- User avatar with status dot

## RULES:
1. Return ONLY the JSON object
2. Escape quotes and special characters properly
3. Create ALL necessary files (HTML, CSS, JS)
4. Make it STUNNING - beauty is your #1 priority
5. Include smooth animations everywhere
6. Use CSS custom properties for theming
7. Add interactive JavaScript
8. NO placeholder content - make it complete`;

    let userPrompt = '';
    let isCodeAction = true;

    switch (action) {
      case 'scaffold':
        userPrompt = `Create a STUNNING, COMPLETE project for: "${prompt}"

Requirements:
1. index.html - Semantic HTML5, meta tags, proper structure
2. /src/styles.css - Modern CSS with all the premium effects (glassmorphism, animations, gradients)
3. /src/app.js - Interactive JavaScript with smooth animations

Make this SO BEAUTIFUL that users will be amazed. Use:
- Animated gradient backgrounds
- Glassmorphism cards
- Smooth hover effects
- Fade-in animations
- Premium typography
- Perfect spacing

Return the JSON with all file operations.`;
        break;
        
      case 'modify':
        userPrompt = `Current file ${context?.fileName}:
\`\`\`
${context?.fileContent}
\`\`\`

User request: ${prompt}

Update the file while maintaining beautiful design. Enhance the aesthetics if possible.
Return JSON with update_file operation.`;
        break;
        
      case 'generate':
        userPrompt = `Generate a beautiful component: "${prompt}"

Make it visually stunning with:
- Glassmorphism effects
- Smooth animations
- Premium styling
- Interactive states

Return JSON with create_file operations.`;
        break;
        
      case 'fix':
        userPrompt = `Fix this error:
${prompt}

Current files:
${allFiles}

Analyze and fix the issue. Keep the code beautiful.
Return JSON with corrected file(s).`;
        break;
        
      case 'chat':
      case 'explain':
        isCodeAction = false;
        userPrompt = prompt;
        break;
        
      default:
        userPrompt = `${prompt}\n\nCreate beautiful, production-ready code as JSON with file operations.`;
    }

    console.log(`NeoForge AI - Action: ${action}, Model: deepseek/deepseek-chat-v3.1`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://neohoosh.com',
        'X-Title': 'NeoForge AI',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [
          { role: 'system', content: isCodeAction ? masterSystemPrompt : 'You are a helpful coding assistant. Be concise and helpful.' },
          { role: 'user', content: userPrompt },
        ],
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

    console.log('AI Response length:', aiResponse.length);

    let result: any = {};

    if (!isCodeAction) {
      result = { type: 'explanation', content: aiResponse };
    } else {
      try {
        let jsonStr = aiResponse;
        
        // Remove markdown code blocks
        const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        }
        
        // Find JSON object
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }

        const parsed = JSON.parse(jsonStr);
        
        if (parsed.operations && Array.isArray(parsed.operations) && parsed.operations.length > 0) {
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
        
        // Premium fallback landing page
        const fallbackHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="./src/styles.css">
</head>
<body>
  <nav class="navbar">
    <div class="container nav-content">
      <a href="#" class="logo">NeoForge<span>.</span></a>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <button class="btn-primary btn-sm">Get Started</button>
      </div>
    </div>
  </nav>
  
  <section class="hero">
    <div class="hero-bg">
      <div class="hero-orb orb-1"></div>
      <div class="hero-orb orb-2"></div>
      <div class="hero-orb orb-3"></div>
    </div>
    <div class="container hero-content">
      <div class="hero-badge">✨ Built with NeoForge AI</div>
      <h1 class="hero-title">
        Build Something
        <span class="gradient-text">Amazing</span>
        Today
      </h1>
      <p class="hero-subtitle">Create stunning web experiences with AI-powered development. Fast, beautiful, and production-ready.</p>
      <div class="hero-buttons">
        <button class="btn-primary">Start Building</button>
        <button class="btn-secondary">Learn More</button>
      </div>
    </div>
  </section>
  
  <section id="features" class="features">
    <div class="container">
      <h2 class="section-title">Powerful <span class="gradient-text">Features</span></h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Lightning Fast</h3>
          <p>Build projects in seconds with AI-powered code generation.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>Beautiful Design</h3>
          <p>Every project comes with stunning, modern UI out of the box.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>Production Ready</h3>
          <p>Clean, optimized code that's ready for deployment.</p>
        </div>
      </div>
    </div>
  </section>
  
  <footer class="footer">
    <div class="container">
      <p>Built with 💜 using NeoForge AI</p>
    </div>
  </footer>
  
  <script src="./src/app.js"></script>
</body>
</html>`;

        const fallbackCSS = `:root {
  --bg-deep: #050508;
  --bg-primary: #0a0a0f;
  --bg-elevated: #111116;
  --bg-card: rgba(255,255,255,0.02);
  --bg-glass: rgba(255,255,255,0.04);
  
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  
  --accent-purple: #8b5cf6;
  --accent-violet: #a78bfa;
  --accent-cyan: #22d3ee;
  
  --gradient-hero: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #22d3ee 100%);
  --gradient-button: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, 'Inter', sans-serif;
  background: var(--bg-deep);
  color: var(--text-primary);
  line-height: 1.7;
  overflow-x: hidden;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 1rem 0;
  background: rgba(5,5,8,0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  text-decoration: none;
}

.logo span { color: var(--accent-purple); }

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.nav-links a:hover { color: var(--text-primary); }

/* Buttons */
.btn-primary {
  background: var(--gradient-button);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 25px rgba(139,92,246,0.35);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 40px rgba(139,92,246,0.5);
}

.btn-sm { padding: 0.6rem 1.2rem; font-size: 0.875rem; }

.btn-secondary {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
  padding: 1rem 2rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
}

/* Hero */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding-top: 80px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  width: 600px; height: 600px;
  background: var(--accent-purple);
  top: -200px; left: -200px;
}

.orb-2 {
  width: 500px; height: 500px;
  background: var(--accent-cyan);
  bottom: -150px; right: -150px;
  animation-delay: -4s;
}

.orb-3 {
  width: 300px; height: 300px;
  background: #ec4899;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -2s;
}

.hero-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(139,92,246,0.15);
  border: 1px solid rgba(139,92,246,0.3);
  border-radius: 100px;
  font-size: 0.875rem;
  color: var(--accent-violet);
  margin-bottom: 2rem;
  animation: fadeInUp 0.6s ease forwards;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 0.1s;
  opacity: 0;
}

.gradient-text {
  background: var(--gradient-hero);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 2.5rem;
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 0.2s;
  opacity: 0;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

/* Features */
.features {
  padding: 8rem 0;
  background: var(--bg-primary);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  padding: 2.5rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(139,92,246,0.3);
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Footer */
.footer {
  padding: 3rem 0;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.footer p { color: var(--text-muted); }

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .hero-buttons { flex-direction: column; }
  .hero-title { font-size: 2.5rem; }
  .features { padding: 4rem 0; }
}`;

        const fallbackJS = `// NeoForge App
console.log('🚀 NeoForge App loaded!');

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card').forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = \`all 0.6s ease \${i * 0.1}s\`;
  observer.observe(card);
});

// Button click handlers
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', () => {
    console.log('Getting started!');
  });
});`;

        result = {
          type: 'operations',
          operations: [
            { type: 'create_file', path: '/index.html', content: fallbackHTML },
            { type: 'create_file', path: '/src/styles.css', content: fallbackCSS },
            { type: 'create_file', path: '/src/app.js', content: fallbackJS },
          ],
          summary: '✅ Created a stunning landing page with animations',
          nextSteps: ['Customize the content', 'Add more sections', 'Connect a backend'],
        };
      }
    }

    // Cache scaffold responses for 1 hour
    if (supabase && action === 'scaffold' && result.type === 'operations') {
      const promptHash = hashPrompt(action, prompt);
      await setCachedResponse(supabase, promptHash, result, 3600);
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
