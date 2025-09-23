import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: conversationContents,
    });

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