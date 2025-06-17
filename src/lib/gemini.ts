import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with error handling
const initializeGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
  }
  return new GoogleGenerativeAI(apiKey);
};

let genAI: GoogleGenerativeAI;
try {
  genAI = initializeGemini();
} catch (error) {
  console.error('Failed to initialize Gemini:', error);
  throw error;
}

export const generatePrompt = (
  topic: string,
  previousQuestion?: string,
  previousAnswer?: string
): string => {
  try {
    let prompt = `You are conducting a professional technical interview about ${topic}.
Your responses should be:
1. Clear and concise (2-3 sentences)
2. Encouraging but professional
3. Focused on practical knowledge
4. Progressive in difficulty

Generate a relevant interview question`;
    
    if (previousQuestion && previousAnswer) {
      prompt += `\n\nPrevious question: ${previousQuestion}\nCandidate's answer: ${previousAnswer}`;
      prompt += '\nBased on this answer, ask a natural follow-up question that probes deeper into their knowledge.';
    }

    prompt += '\nEnsure the question is clear and suitable for verbal communication.';
    
    return prompt;
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw new Error('Failed to generate question');
  }
};

export const generateChatResponse = async (
  topic: string,
  userMessage: string,
  context?: string
): Promise<string> => {
  try {
    const prompt = `You are conducting a technical interview about ${topic}. ${context || ''}
Previous user response: ${userMessage}

Please provide:
1. Brief feedback on their answer (1 sentence)
2. A follow-up question that naturally builds on their response

Keep your entire response under 3 sentences and maintain a professional but encouraging tone.`;

    const result = await genAI
      .getGenerativeModel({ model: "gemini-pro" })
      .generateContent(prompt);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw new Error('Failed to get response');
  }
};