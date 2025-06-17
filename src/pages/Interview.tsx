import React, { useState } from 'react';
import { Mic, MicOff, Play, Loader, Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { useInterviewStore } from '../store/interviewStore';
import { generateQuestion, analyzeResponse } from '../lib/gemini';

const Interview: React.FC = () => {
  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    browserSupportsSpeechRecognition
  } = useVoice();

  const {
    currentQuestion,
    settings,
    setQuestion,
    addAnswer,
    addAnalysis
  } = useInterviewStore();

  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const startInterview = async () => {
    setInterviewStarted(true);
    await getNextQuestion();
  };

  const getNextQuestion = async () => {
    setIsLoading(true);
    try {
      const question = await generateQuestion(
        settings.topic,
        settings.difficulty,
        currentQuestion,
        transcript
      );
      setQuestion(question);
      
      if (voiceEnabled) {
        try {
          await speak(question);
        } catch (error) {
          console.error('Speech synthesis error:', error);
        }
      }
    } catch (error) {
      console.error('Error generating question:', error);
    }
    setIsLoading(false);
  };

  const handleStopRecording = async () => {
    stopListening();
    if (transcript) {
      addAnswer(transcript);
      const analysis = await analyzeResponse(
        currentQuestion,
        transcript,
        settings.topic
      );
      addAnalysis(analysis);
      await getNextQuestion();
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-center text-red-500">
        Browser doesn't support speech recognition.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {settings.topic} - {settings.difficulty}
          </h2>
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-lg ${
              voiceEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {!interviewStarted ? (
          <div className="text-center py-8">
            <button
              onClick={startInterview}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center mx-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Interview
            </button>
          </div>
        ) : (
          <>
            <div className="bg-slate-700 rounded-lg p-6 mb-6">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <p className="text-lg">{currentQuestion}</p>
              )}
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={isListening ? handleStopRecording : startListening}
                className={`p-4 rounded-full ${
                  isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={isLoading || isSpeaking}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Live Transcript</h3>
        <div className="bg-slate-700 rounded-lg p-4 min-h-[100px]">
          {transcript}
        </div>
      </div>
    </div>
  );
};

export default Interview;