import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface InterviewSettings {
  topic: string;
  difficulty: string;
  duration: number;
}

interface Analysis {
  clarity: number;
  relevance: number;
  technicalAccuracy: number;
  confidence: number;
  feedback: string[];
  improvements: string[];
}

interface InterviewState {
  currentQuestion: string;
  questions: string[];
  answers: string[];
  analysis: Analysis[];
  settings: InterviewSettings;
  error: string | null;
  isLoading: boolean;
  setQuestion: (question: string) => void;
  addAnswer: (answer: string) => void;
  addAnalysis: (analysis: Analysis) => void;
  updateSettings: (settings: Partial<InterviewSettings>) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentQuestion: '',
  questions: [],
  answers: [],
  analysis: [],
  settings: {
    topic: 'Technical Interview',
    difficulty: 'Mid-Level',
    duration: 30
  },
  error: null,
  isLoading: false
};

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      ...initialState,
      setQuestion: (question) =>
        set((state) => ({
          currentQuestion: question,
          questions: [...state.questions, question],
          error: null
        })),
      addAnswer: (answer) =>
        set((state) => ({
          answers: [...state.answers, answer],
          error: null
        })),
      addAnalysis: (analysis) =>
        set((state) => ({
          analysis: [...state.analysis, analysis],
          error: null
        })),
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
          error: null
        })),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set(initialState)
    }),
    {
      name: 'interview-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);