import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({
    clearTranscriptOnListen: true,
  });

  useEffect(() => {
    const checkBrowserSupport = async () => {
      try {
        if (!browserSupportsSpeechRecognition) {
          setError('Browser does not support speech recognition.');
          return;
        }

        if (!isMicrophoneAvailable) {
          const permission = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (!permission) {
            setError('Microphone access is required.');
            return;
          }
        }

        setIsInitialized(true);
      } catch (err) {
        setError('Failed to initialize voice features. Please check permissions.');
      }
    };

    checkBrowserSupport();
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  const startListening = useCallback(async () => {
    try {
      if (!isInitialized) {
        throw new Error('Voice features not initialized');
      }

      setError(null);
      setIsListening(true);
      resetTranscript();
      await SpeechRecognition.startListening({ continuous: true });
    } catch (err) {
      setError('Failed to start listening. Please check microphone permissions.');
      setIsListening(false);
    }
  }, [isInitialized, resetTranscript]);

  const stopListening = useCallback(() => {
    try {
      setIsListening(false);
      SpeechRecognition.stopListening();
    } catch (err) {
      setError('Failed to stop listening.');
    }
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (!window.speechSynthesis) {
          throw new Error('Speech synthesis not supported');
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get available voices
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(
            voice => voice.lang === 'en-US' && (voice.name.includes('Google') || voice.name.includes('Natural'))
          );
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          
          // Configure speech parameters
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          // Set up event handlers
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => {
            setIsSpeaking(false);
            resolve();
          };
          utterance.onerror = (event) => {
            setIsSpeaking(false);
            setError(`Speech synthesis error: ${event.error}`);
            reject(new Error(`Speech synthesis error: ${event.error}`));
          };

          // Start speaking
          window.speechSynthesis.speak(utterance);
        };

        // Handle voice loading
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        } else {
          loadVoices();
        }
      } catch (err) {
        setError('Failed to initialize speech synthesis.');
        reject(err);
      }
    });
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    isInitialized,
    startListening,
    stopListening,
    speak,
    browserSupportsSpeechRecognition
  };
};