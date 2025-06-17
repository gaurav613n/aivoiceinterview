import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useVoice } from '../hooks/useVoice';
import { useSpeech } from '../hooks/useSpeech';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore, Message, Session } from '../store/interviewStore';
import { generateChatResponse } from '../lib/gemini';
import { v4 as uuidv4 } from 'uuid';

const Interview: React.FC = () => {
  const navigate = useNavigate();
  const { startListening, stopListening, isListening, transcript } = useVoice();
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeech();
  const [responses, setResponses] = useState<Message[]>([]);
  const { addSession, settings } = useInterviewStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [autoListen, setAutoListen] = useState(false);
  const messageQueueRef = useRef<string[]>([]);

  // Start with welcome message
  // Handle speaking messages in sequence
  useEffect(() => {
    const speakNextMessage = async () => {
      if (messageQueueRef.current.length > 0 && !isSpeaking && !isListening) {
        const nextMessage = messageQueueRef.current.shift();
        if (nextMessage) {
          try {
            await speak(nextMessage);
            if (autoListen) {
              startListening();
            }
          } catch (error) {
            console.error('Speech synthesis error:', error);
          }
        }
      }
    };

    speakNextMessage();
  }, [isSpeaking, isListening, speak, startListening, autoListen]);

  // Initialize interview
  useEffect(() => {
    const initializeInterview = async () => {
      const welcomeMessage: Message = {
        text: `Welcome to your ${settings.topic} technical interview! I'll be asking you some questions about ${settings.topic}. Please take your time to respond thoughtfully. Are you ready to begin?`,
        sender: 'gemini',
        timestamp: new Date().toISOString()
      };
      setResponses([welcomeMessage]);
      setCurrentQuestion(welcomeMessage.text);
      messageQueueRef.current.push(welcomeMessage.text);
    };

    initializeInterview();
  }, [settings.topic]);

  const handleUserResponse = useCallback(async (text: string) => {
    if (!text.trim()) return;

    stopSpeaking(); // Stop any ongoing speech before processing
    setIsLoading(true);
    try {
      // Add user's response
      const userMessage: Message = {
        text: text,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      setResponses(prev => [...prev, userMessage]);

      // Get context from previous exchanges
      const context = responses.length > 0 
        ? `Previous exchange: "${responses[responses.length - 1].text}"`
        : 'This is the start of the interview';

      // Get Gemini's response
      let retryCount = 0;
      let geminiResponse: string;
      
      while (retryCount < 3) {
        try {
          geminiResponse = await generateChatResponse(
            settings.topic,
            text,
            context
          );
          break;
        } catch (error) {
          retryCount++;
          if (retryCount === 3) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }

      // Add Gemini's response
      const geminiMessage: Message = {
        text: geminiResponse!,
        sender: 'gemini',
        timestamp: new Date().toISOString()
      };
      setResponses(prev => [...prev, geminiMessage]);
      setCurrentQuestion(geminiResponse!);
      
      // Queue the response for speech
      messageQueueRef.current.push(geminiResponse!);
    } catch (error) {
      console.error('Error processing response:', error);
      // Create a more natural error response that keeps the conversation going
      const errorMessage = `I apologize for the technical hiccup. Let's continue our discussion about ${settings.topic}. Could you tell me about your experience with ${settings.topic}?`;
      setResponses(prev => [...prev, {
        text: errorMessage,
        sender: 'gemini',
        timestamp: new Date().toISOString()
      }]);
      messageQueueRef.current.push(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [responses, settings.topic, stopSpeaking]);

  const handleStartInterview = useCallback(() => {
    setIsLoading(false);
    setAutoListen(true);
    startListening();
  }, [startListening]);

  const handleStopInterview = useCallback(async () => {
    stopListening();
    setAutoListen(false);
    if (transcript) {
      await handleUserResponse(transcript);
    }
  }, [stopListening, transcript, handleUserResponse]);

  const handleFinishInterview = useCallback(() => {
    stopSpeaking();
    stopListening();
    setAutoListen(false);
    
    const farewellMessage = "Thank you for completing the interview. I'll now analyze your responses and prepare your report.";
    messageQueueRef.current.push(farewellMessage);
    
    // Create and save the session before navigating
    const session: Session = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      messages: responses,
      settings: {
        topic: settings.topic
      }
    };
    
    // Wait for farewell message to be spoken before navigating
    const checkAndNavigate = () => {
      if (!isSpeaking && messageQueueRef.current.length === 0) {
        addSession(session);
        navigate('/reports');
      } else {
        setTimeout(checkAndNavigate, 500);
      }
    };
    
    checkAndNavigate();
  }, [stopSpeaking, stopListening, responses, settings.topic, addSession, navigate, isSpeaking]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Interview Session</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Current Session</h2>
            <div className="flex gap-4">
              {!isListening ? (
                <button
                  onClick={handleStartInterview}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  disabled={isLoading || isSpeaking}
                >
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={handleStopInterview}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Stop Recording
                </button>
              )}
              <button
                onClick={handleFinishInterview}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={isLoading || isSpeaking}
              >
                Finish Interview
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isListening ? 'bg-red-500 animate-pulse' : 
                isSpeaking ? 'bg-blue-500 animate-pulse' : 
                'bg-gray-400'
              }`} />
              <span className="text-sm font-medium">
                {isListening ? 'Listening...' : 
                 isSpeaking ? 'Speaking...' : 
                 'Ready'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setAutoListen(!autoListen)}
                className={`px-3 py-1 text-sm rounded ${
                  autoListen 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Auto-Listen {autoListen ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Current Question</h3>
          <p className="text-gray-800">{currentQuestion}</p>
        </div>

        {isListening && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <p className="font-medium">Listening...</p>
            {transcript && <p className="mt-2 text-gray-600">{transcript}</p>}
          </div>
        )}

        {isLoading && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p className="text-yellow-700">Processing your response...</p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Interview Responses</h3>
          {responses.length === 0 ? (
            <p className="text-gray-500">No responses recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div 
                  key={index} 
                  className={`border-l-4 pl-4 py-2 ${
                    response.sender === 'gemini' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-green-500 bg-green-50'
                  }`}
                >
                  <p className="text-gray-800">{response.text}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500">
                      {response.sender === 'gemini' ? 'Interviewer' : 'You'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(response.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
