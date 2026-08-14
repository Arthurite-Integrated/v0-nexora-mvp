import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Ordered lightweight fallbacks, spread across model generations so a
// single family being overloaded doesn't take out every option.
const MODEL_FALLBACKS = [
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
];

const RETRYABLE_STATUS = new Set([503, 429]);

function isRetryable(error: any): boolean {
  const status = error?.status ?? error?.error?.code;
  return RETRYABLE_STATUS.has(status);
}

async function generateWithFallback(contents: any[]) {
  let lastError: unknown;

  for (const model of MODEL_FALLBACKS) {
    try {
      const response = await ai.models.generateContent({ model, contents });
      return { response, model };
    } catch (error) {
      lastError = error;
      if (!isRetryable(error)) throw error;
      console.warn(`Model ${model} unavailable, falling back...`, (error as any)?.message);
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory = [] } = await request.json()

    // Build the conversation contents with full history
    const conversationContents = [
      // System message with context
      {
        role: "user",
        parts: [{
          text: `You are Nexora Assistant, a helpful AI specialized in intellectual and developmental disabilities (IDD) care and support. You provide compassionate, evidence-based guidance to families, caregivers, and individuals with IDD.

Context: ${context}

Guidelines:
- Always respond with empathy and understanding
- Provide practical, actionable advice when possible
- Acknowledge when professional consultation is recommended
- Maintain a warm, supportive tone throughout the conversation
- Remember the conversation history and build upon previous exchanges
- IMPORTANT: Respond ONLY with plain text, remove ALL markdown formatting

Please continue the conversation naturally, referencing previous messages when relevant.`
        }]
      }
    ];

    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      conversationContents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    });

    // Add current user message
    conversationContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const { response, model } = await generateWithFallback(conversationContents);
    if (model !== MODEL_FALLBACKS[0]) {
      console.log(`Chat API used fallback model: ${model}`);
    }

    const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response. Please try again or contact our support team for assistance.";

    return NextResponse.json({
      reply: textResponse,
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ 
      error: "Failed to process chat request" 
    }, { status: 500 });
  }
}