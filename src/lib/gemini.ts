import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with error handling
const initializeGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
};

const genAI = initializeGemini();

export const generateQuestion = async (
  topic: string,
  difficulty: string,
  previousQuestion?: string,
  previousAnswer?: string
): Promise<string> => {
  try {
    const prompt = `Generate a professional ${difficulty} level interview question about ${topic}.${
      previousQuestion && previousAnswer
        ? `\nPrevious question: ${previousQuestion}\nCandidate's answer: ${previousAnswer}`
        : ''
    }`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response.text()) {
      throw new Error('Empty response from Gemini API');
    }
    
    return response.text();
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error('Failed to generate interview question');
  }
};

export const analyzeResponse = async (
  question: string,
  answer: string,
  topic: string
): Promise<any> => {
  try {
    const prompt = `Analyze this interview response for a ${topic} position:
Question: ${question}
Answer: ${answer}

Provide analysis in JSON format with these fields:
- clarity (0-100): How clear and well-structured the response is
- relevance (0-100): How relevant the answer is to the question
- technicalAccuracy (0-100): Technical correctness of the response
- confidence (0-100): Perceived confidence level
- feedback: Constructive feedback points
- improvements: Suggested improvements`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    const analysisText = response.text();
    if (!analysisText) {
      throw new Error('Empty response from Gemini API');
    }
    
    return JSON.parse(analysisText);
  } catch (error) {
    console.error('Error analyzing response:', error);
    throw new Error('Failed to analyze interview response');
  }
};