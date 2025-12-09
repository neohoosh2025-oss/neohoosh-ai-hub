import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileOperation } from './filesStore';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  operations?: FileOperation[];
  timestamp: number;
  applied?: boolean;
}

export interface PreviewError {
  message: string;
  stack?: string;
  timestamp: number;
}

interface NeoForgeState {
  // AI Conversation
  messages: AiMessage[];
  isLoading: boolean;
  selectedAction: 'scaffold' | 'generate' | 'modify' | 'chat';
  
  // Preview errors
  previewError: PreviewError | null;
  
  // Actions
  addMessage: (message: Omit<AiMessage, 'id'>) => void;
  updateLastMessage: (content: string, operations?: FileOperation[]) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setSelectedAction: (action: 'scaffold' | 'generate' | 'modify' | 'chat') => void;
  setPreviewError: (error: PreviewError | null) => void;
  
  // Fix functionality
  getErrorContext: () => string;
}

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const useNeoForgeStore = create<NeoForgeState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      selectedAction: 'scaffold',
      previewError: null,

      addMessage: (message) => set((state) => ({
        messages: [...state.messages, { ...message, id: generateId() }]
      })),

      updateLastMessage: (content, operations) => set((state) => {
        const messages = [...state.messages];
        const lastIndex = messages.length - 1;
        if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
          messages[lastIndex] = {
            ...messages[lastIndex],
            content,
            operations,
            applied: operations && operations.length > 0,
          };
        }
        return { messages };
      }),

      clearMessages: () => set({ messages: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      setSelectedAction: (action) => set({ selectedAction: action }),

      setPreviewError: (error) => set({ previewError: error }),

      getErrorContext: () => {
        const { previewError, messages } = get();
        if (!previewError) return '';
        
        // Get last user message for context
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        
        return `
Error in preview: ${previewError.message}
${previewError.stack ? `Stack: ${previewError.stack}` : ''}
${lastUserMessage ? `Last request: ${lastUserMessage.content}` : ''}
        `.trim();
      },
    }),
    {
      name: 'neoforge-ai-state',
      partialize: (state) => ({
        messages: state.messages,
        selectedAction: state.selectedAction,
      }),
    }
  )
);
