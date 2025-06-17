import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useVoice } from '../hooks/useVoice';
import { useInterviewStore } from '../store/interviewStore';
import { Mic, MicOff, Loader } from 'lucide-react';
import type { Message } from '../store/interviewStore';
import ErrorBoundary from '../components/ErrorBoundary';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const INITIAL_PROMPT = `You are conducting a professional technical interview in English. Follow these guidelines:
1. Be friendly and encouraging, but maintain professionalism
2. Ask one clear question at a time
3. Start with basic concepts and gradually increase difficulty
4. Keep your responses concise (2-3 sentences)
5. If the answer is incorrect: briefly explain why and provide a simple example
6. If the answer is correct: give a short compliment and move to a slightly harder question
7. Use clear, standard English and avoid complex technical jargon
8. Focus on practical, real-world scenarios when possible`;

const Interview: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<any>(null);
  const processingRef = useRef(false);

  const { settings, addSession } = useInterviewStore();

  const {
    isListening,
    startListening,
    stopListening,
    speak,
    isInitialized: voiceInitialized,
    reset: resetVoice,
  } = useVoice({
    onSpeechEnd: async (transcript) => {
      if (transcript && !processingRef.current) {
        await handleUserResponse(transcript);
      }
    },
    onError: (error) => {
      setError(error);
      setTimeout(() => setError(null), 3000);
    },
  });

  // Start interview
  const startInterview = useCallback(async () => {
    if (!chatRef.current || isInterviewStarted) return;

    try {
      const greeting = `Hello! Welcome to your ${settings.topic} interview. Are you ready to begin?`;
      
      const message: Message = {
        text: greeting,
        sender: 'gemini',
        timestamp: new Date().toISOString(),
      };

      setMessages([message]);
      await speak(greeting);
      setIsInterviewStarted(true);
      startListening();
    } catch (err) {
      setError('Failed to start interview. Please try again.');
      console.error('Start interview error:', err);
    }
  }, [settings.topic, speak, startListening, isInterviewStarted]);

  // Initialize chat
  useEffect(() => {
    if (!voiceInitialized || chatRef.current) return;

    try {
      chatRef.current = model.startChat({
        history: [
          {
            role: 'user',
            parts: `${INITIAL_PROMPT}\nThis is a ${settings.topic} interview.`,
          },
          {
            role: 'model',
            parts: 'I understand. I will conduct a friendly interview about ' + settings.topic,
          },
        ],
      });

      startInterview();
    } catch (err) {
      setError('Failed to start interview. Please refresh the page.');
      console.error('Chat init error:', err);
    }
  }, [voiceInitialized, settings.topic, startInterview]);

  // Save session when it ends
  useEffect(() => {
    return () => {
      if (messages.length > 0) {
        const session = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          messages,
          settings,
        };
        addSession(session);
      }
    };
  }, [messages, settings, addSession]);

  // Handle user's response
  const handleUserResponse = async (transcript: string) => {
    if (processingRef.current || !chatRef.current) return;
    
    try {
      processingRef.current = true;
      stopListening();

      const userMessage: Message = {
        text: transcript,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      setIsThinking(true);
      const result = await chatRef.current.sendMessage(transcript);
      const response = await result.response;
      const geminiResponse = response.text();
      
      const geminiMessage: Message = {
        text: geminiResponse,
        sender: 'gemini',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, geminiMessage]);
      await speak(geminiResponse);
      startListening();
    } catch (err) {
      setError('Sorry, there was an error. Please try again.');
      console.error('Response error:', err);
      resetVoice();
    } finally {
      setIsThinking(false);
      processingRef.current = false;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full max-w-3xl mx-auto p-4 space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            {isListening ? (
              <Mic className="w-5 h-5 text-green-500 animate-pulse" />
            ) : (
              <MicOff className="w-5 h-5 text-gray-500" />
            )}
            <span className="text-sm">
              {isListening ? 'Listening...' : 'Click to speak'}
            </span>
          </div>
          {isThinking && (
            <div className="flex items-center space-x-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-[400px] bg-gray-900 p-4 rounded-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center p-4">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isInterviewStarted || isThinking}
            className={`px-6 py-3 rounded-full flex items-center space-x-2 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Start Speaking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Interview;