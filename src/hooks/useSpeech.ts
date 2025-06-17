import { useState, useCallback } from 'react';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure the voice - try to use a natural sounding voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Premium') ||
        voice.name.includes('Neural')
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Configure speech parameters for clarity
      utterance.rate = 1.0;  // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0;

      // Event handlers
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (error) => {
        setIsSpeaking(false);
        reject(error);
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking
  };
};
