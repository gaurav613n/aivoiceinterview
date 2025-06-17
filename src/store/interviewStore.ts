import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  text: string;
  sender: 'user' | 'gemini';
  timestamp: string;
}

export interface Session {
  id: string;
  timestamp: string;
  messages: Message[];
  settings: {
    topic: string;
  };
  analysis?: {
    score: number;
    feedback: string[];
    improvements: string[];
    strengths: string[];
    overallAssessment: string;
  };
}

interface InterviewState {
  settings: {
    topic: string;
  };
  sessions: Session[];
  setSettings: (settings: { topic: string }) => void;
  addSession: (session: Session) => void;
  deleteSessions: (ids: string[]) => Promise<void>;
  exportSession: (id: string) => Promise<Blob>;
}

const createStore = (
  set: Parameters<StateCreator<InterviewState>>[0],
  get: () => InterviewState
): InterviewState => ({
  settings: {
    topic: 'JavaScript',
  },
  sessions: [],
  setSettings: (newSettings) => set({ settings: newSettings }),
  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),
  deleteSessions: async (ids) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => !ids.includes(s.id)),
    })),
  exportSession: async (id) => {
    const state = get();
    const session = state.sessions.find((s) => s.id === id);
    if (!session) throw new Error('Session not found');
    return new Blob([JSON.stringify(session, null, 2)], {
      type: 'application/json',
    });
  },
});

export const useInterviewStore = create<InterviewState>()(
  persist(createStore, {
    name: 'interview-store',
  })
);