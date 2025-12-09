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

export interface Conversation {
  id: string;
  title: string;
  messages: AiMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface PreviewError {
  message: string;
  stack?: string;
  timestamp: number;
}

interface NeoForgeState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  
  // Current state
  isLoading: boolean;
  selectedAction: 'scaffold' | 'generate' | 'modify' | 'chat';
  previewError: PreviewError | null;
  
  // Sidebar
  showHistory: boolean;
  
  // Getters
  getActiveConversation: () => Conversation | null;
  getMessages: () => AiMessage[];
  
  // Conversation Actions
  createConversation: (title?: string) => string;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  
  // Message Actions
  addMessage: (message: Omit<AiMessage, 'id'>) => void;
  updateLastMessage: (content: string, operations?: FileOperation[]) => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setSelectedAction: (action: 'scaffold' | 'generate' | 'modify' | 'chat') => void;
  setPreviewError: (error: PreviewError | null) => void;
  setShowHistory: (show: boolean) => void;
  
  // Utility
  getErrorContext: () => string;
}

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

const generateTitle = (firstMessage: string): string => {
  const cleaned = firstMessage.replace(/[\n\r]+/g, ' ').trim();
  return cleaned.length > 40 ? cleaned.substring(0, 40) + '...' : cleaned;
};

export const useNeoForgeStore = create<NeoForgeState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      selectedAction: 'scaffold',
      previewError: null,
      showHistory: false,

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find(c => c.id === activeConversationId) || null;
      },

      getMessages: () => {
        const conversation = get().getActiveConversation();
        return conversation?.messages || [];
      },

      createConversation: (title?: string) => {
        const id = generateId();
        const newConversation: Conversation = {
          id,
          title: title || 'New Project',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set(state => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: id,
        }));
        
        return id;
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id, previewError: null });
      },

      deleteConversation: (id) => {
        set(state => {
          const newConversations = state.conversations.filter(c => c.id !== id);
          const newActiveId = state.activeConversationId === id 
            ? (newConversations[0]?.id || null)
            : state.activeConversationId;
          return { 
            conversations: newConversations, 
            activeConversationId: newActiveId 
          };
        });
      },

      renameConversation: (id, title) => {
        set(state => ({
          conversations: state.conversations.map(c => 
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        }));
      },

      addMessage: (message) => {
        const { activeConversationId, conversations, createConversation } = get();
        
        // Create new conversation if none exists
        let convId = activeConversationId;
        if (!convId) {
          convId = createConversation();
        }
        
        const newMessage: AiMessage = { ...message, id: generateId() };
        
        set(state => ({
          conversations: state.conversations.map(c => {
            if (c.id === convId) {
              const updatedConv = {
                ...c,
                messages: [...c.messages, newMessage],
                updatedAt: Date.now(),
              };
              
              // Update title from first user message
              if (message.role === 'user' && c.messages.length === 0) {
                updatedConv.title = generateTitle(message.content);
              }
              
              return updatedConv;
            }
            return c;
          }),
        }));
      },

      updateLastMessage: (content, operations) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;
        
        set(state => ({
          conversations: state.conversations.map(c => {
            if (c.id === activeConversationId) {
              const messages = [...c.messages];
              const lastIndex = messages.length - 1;
              
              if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
                messages[lastIndex] = {
                  ...messages[lastIndex],
                  content,
                  operations,
                  applied: operations && operations.length > 0,
                };
              }
              
              return { ...c, messages, updatedAt: Date.now() };
            }
            return c;
          }),
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setSelectedAction: (action) => set({ selectedAction: action }),

      setPreviewError: (error) => set({ previewError: error }),
      
      setShowHistory: (show) => set({ showHistory: show }),

      getErrorContext: () => {
        const { previewError } = get();
        const messages = get().getMessages();
        if (!previewError) return '';
        
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        
        return `
Error in preview: ${previewError.message}
${previewError.stack ? `Stack: ${previewError.stack}` : ''}
${lastUserMessage ? `Last request: ${lastUserMessage.content}` : ''}
        `.trim();
      },
    }),
    {
      name: 'neoforge-conversations',
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        selectedAction: state.selectedAction,
      }),
    }
  )
);
