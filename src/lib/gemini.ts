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
    let prompt = `You are an expert technical interviewer conducting an interview about ${topic}.
You must always respond naturally to whatever the candidate says, whether it's directly related to the topic or not.
If they say something off-topic, acknowledge it briefly and guide them back to the technical discussion.
If they ask you a question, answer it concisely and then continue with the interview.

Latest response from candidate: "${userMessage}"

${context ? `Context: ${context}\n` : ''}

Your response should:
1. Briefly acknowledge their response (1 sentence)
2. If off-topic, gently guide back to the interview
3. Ask a clear, relevant ${topic}-related question
4. Keep total response under 3-4 sentences
5. Be encouraging and professional
6. If they ask about a different topic, briefly answer and then ask a ${topic} question

Format: First acknowledge/respond to them, then ask your technical question.`;

    const result = await genAI
      .getGenerativeModel({ model: "gemini-pro", generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 200,
      }})
      .generateContent(prompt);
    
    if (!result.response) {
      throw new Error('No response generated');
    }

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw new Error('Failed to get response');
  }
};