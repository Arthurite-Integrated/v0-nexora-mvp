"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  "What are the early signs of developmental delays?",
  "How can I help my child with communication difficulties?",
  "What should I expect during an IEP meeting?",
  "How do I find the right therapist for my child?",
  "What are some strategies for managing behavioral challenges?",
  "How can I prepare my child for transitions?",
]

export default function GeminiChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your IDD Care Assistant. I'm here to help answer questions about intellectual and developmental disabilities, care strategies, and support resources. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simulate API call to Gemini
      // In production, this would call your API route that connects to Gemini
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          context: "IDD care and support",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.response ||
          "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team for assistance.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)

      // Fallback response for demo purposes
      const fallbackResponse = getFallbackResponse(text)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getFallbackResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes("early signs") || lowerQuestion.includes("developmental delay")) {
      return "Early signs of developmental delays can include: delayed speech or language skills, difficulty with motor skills like walking or fine motor control, challenges with social interaction, repetitive behaviors, and delays in cognitive milestones. It's important to consult with a pediatrician or developmental specialist if you notice these signs. Early intervention services can make a significant difference in outcomes."
    }

    if (lowerQuestion.includes("communication") || lowerQuestion.includes("speech")) {
      return "For communication difficulties, consider: using visual supports like picture cards or communication boards, practicing simple sign language, reading together daily, giving extra time for responses, and working with a speech-language pathologist. Assistive technology devices can also be very helpful for non-verbal individuals."
    }

    if (lowerQuestion.includes("iep") || lowerQuestion.includes("school")) {
      return "For IEP meetings, prepare by: reviewing your child's current progress, listing specific concerns and goals, bringing any recent evaluations or reports, preparing questions about services and accommodations, and considering bringing an advocate if needed. Remember, you are an equal member of the IEP team."
    }

    if (lowerQuestion.includes("behavior") || lowerQuestion.includes("challenging")) {
      return "Behavioral strategies include: identifying triggers and patterns, using positive reinforcement, creating structured routines, teaching coping skills, providing sensory breaks, and working with a behavior analyst if needed. Consistency across all environments is key to success."
    }

    return "Thank you for your question about IDD care. While I'd love to provide specific guidance, I recommend consulting with qualified healthcare professionals for personalized advice. You can browse our directory of verified professionals or schedule a consultation through our platform. Is there a specific aspect of care you'd like general information about?"
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your IDD Care Assistant. I'm here to help answer questions about intellectual and developmental disabilities, care strategies, and support resources. How can I assist you today?",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-teal-600" />
          <span className="font-medium">IDD Care Assistant</span>
          <Badge variant="secondary" className="text-xs">
            AI Powered
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-gray-500 hover:text-gray-700">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-teal-600" />
                </div>
              </div>
            )}

            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.role === "user" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-900",
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <div className={cn("text-xs mt-1", message.role === "user" ? "text-teal-100" : "text-gray-500")}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-teal-600" />
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Try asking about:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs h-auto py-2 px-3 text-left"
                disabled={isLoading}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about IDD care, treatments, or support..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This AI assistant provides general information. Always consult healthcare professionals for medical advice.
        </p>
      </div>
    </div>
  )
}
