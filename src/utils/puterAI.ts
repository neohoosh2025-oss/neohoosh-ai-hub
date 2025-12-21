// Puter.js AI integration
// This uses the free Puter.js API for AI chat

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          messages: string | Array<{ role: string; content: string }>,
          options?: { model?: string; stream?: boolean }
        ) => Promise<any>;
      };
    };
  }
}

export interface PuterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function puterAIChat(
  messages: PuterMessage[],
  model: string = 'deepseek/deepseek-v3.2'
): Promise<string> {
  if (!window.puter) {
    throw new Error('Puter.js SDK not loaded');
  }

  try {
    const response = await window.puter.ai.chat(messages, { model });
    
    // Handle different response formats
    if (typeof response === 'string') {
      return response;
    }
    
    if (response?.message?.content) {
      return response.message.content;
    }
    
    if (response?.content) {
      return response.content;
    }
    
    return String(response);
  } catch (error) {
    console.error('Puter AI error:', error);
    throw error;
  }
}

export async function* puterAIChatStream(
  messages: PuterMessage[],
  model: string = 'deepseek/deepseek-v3.2'
): AsyncGenerator<string, void, unknown> {
  if (!window.puter) {
    throw new Error('Puter.js SDK not loaded');
  }

  try {
    const response = await window.puter.ai.chat(messages, { 
      model, 
      stream: true 
    });
    
    // If streaming is supported
    if (response && typeof response[Symbol.asyncIterator] === 'function') {
      for await (const part of response) {
        if (part?.text) {
          yield part.text;
        } else if (typeof part === 'string') {
          yield part;
        }
      }
    } else {
      // Fallback to non-streaming
      const text = typeof response === 'string' 
        ? response 
        : response?.message?.content || response?.content || String(response);
      yield text;
    }
  } catch (error) {
    console.error('Puter AI stream error:', error);
    throw error;
  }
}

export function isPuterLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.puter?.ai?.chat;
}
