import { create } from 'zustand';

import type { AgentId } from '../types/agents';
import type { ChatMessage } from '../types/chat';

interface ChatStore {
  messages: ChatMessage[];
  activeAgents: AgentId[];
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setActiveAgents: (agents: AgentId[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>()((set) => ({
  messages: [],
  activeAgents: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),
  setActiveAgents: (agents) => set({ activeAgents: agents }),
  clearMessages: () => set({ messages: [] }),
}));
