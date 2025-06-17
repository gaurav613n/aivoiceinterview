import { useState, useEffect, useCallback, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface UseSpeechProps {
  onSpeechEnd?: (transcript: string) => void;
  onError?: (error: string) => void;
}

// Helper function to find the best available voice
const findEnglishVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  // Try to find a good English voice
  return voices.find(voice => 
    voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
  ) || voices.find(voice => 
    voice.lang.startsWith('en')
  ) || voices[0] || null;
};

export const useVoice = ({ 
  onSpeechEnd, 
  onError 
}: UseSpeechProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const speakQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    clearTranscriptOnListen: true
  });

  // Initialize voice system
  useEffect(() => {
    const initVoice = () => {
      if (!browserSupportsSpeechRecognition) {
        throw new Error('Speech recognition not supported');
      }
      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis not supported');
      }

      // Get voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        selectedVoiceRef.current = findEnglishVoice(voices);
        setIsInitialized(true);
      }
    };

    try {
      // Try immediate init
      initVoice();

      // Also listen for voiceschanged event
      const onVoicesChanged = () => {
        try {
          initVoice();
        } catch (err) {
          onError?.(err instanceof Error ? err.message : 'Voice initialization failed');
        }
      };

      window.speechSynthesis.onvoiceschanged = onVoicesChanged;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    } catch (err) {
      console.error('Initial voice init error:', err);
      onError?.(err instanceof Error ? err.message : 'Voice initialization failed');
    }
  }, [browserSupportsSpeechRecognition, onError]);

  // Speak text
  const speak = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isInitialized || !selectedVoiceRef.current) {
        reject(new Error('Voice not initialized'));
        return;
      }

      // If already speaking, queue this text
      if (isSpeakingRef.current) {
        speakQueueRef.current.push(text);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoiceRef.current;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Set up handlers
      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        
        // Check queue for next text
        if (speakQueueRef.current.length > 0) {
          const nextText = speakQueueRef.current.shift();
          if (nextText) {
            speak(nextText).then(resolve).catch(reject);
            return;
          }
        }
        resolve();
      };

      utterance.onerror = (event) => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Clear any ongoing speech and speak
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }, [isInitialized]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isInitialized) {
      onError?.('Voice system not initialized');
      return;
    }

    try {
      setIsListening(true);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    } catch (err) {
      setIsListening(false);
      onError?.(err instanceof Error ? err.message : 'Failed to start listening');
    }
  }, [isInitialized, onError, resetTranscript]);

  // Stop listening
  const stopListening = useCallback(() => {
    try {
      setIsListening(false);
      SpeechRecognition.stopListening();
      if (transcript?.trim()) {
        onSpeechEnd?.(transcript.trim());
      }
      resetTranscript();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to stop listening');
    }
  }, [transcript, onSpeechEnd, resetTranscript, onError]);

  // Reset everything
  const reset = useCallback(() => {
    window.speechSynthesis.cancel();
    SpeechRecognition.abortListening();
    setIsListening(false);
    setIsSpeaking(false);
    resetTranscript();
    speakQueueRef.current = [];
    isSpeakingRef.current = false;
  }, [resetTranscript]);

  return {
    speak,
    isListening,
    isSpeaking,
    isInitialized,
    transcript,
    startListening,
    stopListening,
    reset
  };
};