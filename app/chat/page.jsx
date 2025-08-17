"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Send, Bot, User, Calendar, Clock, Stethoscope } from "lucide-react"

export default function ChatPage() {
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctor")
  const doctorName = searchParams.get("name")
  const doctorSpecialty = searchParams.get("specialty")

  const [messages, setMessages] = useState(() => {
    if (doctorId) {
      return [
        {
          id: "initial",
          role: "assistant",
          content: `Hello! I'm here to help you book an appointment with ${doctorName}, our ${doctorSpecialty}. I can check their availability, schedule your appointment, and answer any questions about their services. How can I assist you today?`,
        },
      ]
    }
    return []
  })

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [responseId, setResponseId] = useState(null)
  const messagesEndRef = useRef(null)

  // Load responseId from sessionStorage on component mount
  useEffect(() => {
    const storedResponseId = sessionStorage.getItem("chatResponseId")
    if (storedResponseId) {
      setResponseId(storedResponseId)
    }
  }, [])

  // Save responseId to sessionStorage whenever it changes
  useEffect(() => {
    if (responseId) {
      sessionStorage.setItem("chatResponseId", responseId)
    }
  }, [responseId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickActions = doctorId
    ? [
        {
          text: `Book appointment with ${doctorName}`,
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          text: `Check ${doctorName}'s availability`,
          icon: <Clock className="h-4 w-4" />,
        },
        {
          text: `Tell me about ${doctorSpecialty} services`,
          icon: <Stethoscope className="h-4 w-4" />,
        },
        {
          text: "What should I prepare for my visit?",
          icon: <Bot className="h-4 w-4" />,
        },
      ]
    : [
        { text: "Book an appointment", icon: <Calendar className="h-4 w-4" /> },
        {
          text: "View available doctors",
          icon: <Stethoscope className="h-4 w-4" />,
        },
        {
          text: "Check appointment status",
          icon: <Clock className="h-4 w-4" />,
        },
        { text: "Emergency contact", icon: <Bot className="h-4 w-4" /> },
      ]

  const handleQuickAction = (text) => {
    setInput(text)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      // Prepare request payload - only send current message and responseId
      const requestPayload = {
        message: currentInput,
        ...(responseId && { responseId }),
      }

      console.log("Sending request:", requestPayload)

      const response = await axios.post("/api/chat", requestPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Received response:", response.data)

      // Extract content and responseId from response
      const { content, responseId: newResponseId } = response.data

      // Update responseId for next request
      if (newResponseId) {
        setResponseId(newResponseId)
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: content || "I'm sorry, I didn't receive a proper response. Please try again.",
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)

      // Handle different types of errors
      let errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."

      if (error.response) {
        // Server responded with error status
        console.error("Server error:", error.response.data)
        errorMessage = `Server error: ${error.response.status}. Please try again.`
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request)
        errorMessage = "No response from server. Please check your connection and try again."
      } else {
        // Something else happened
        console.error("Request setup error:", error.message)
      }

      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMessage,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  // Clear session function (optional - for debugging or reset)
  const clearSession = () => {
    sessionStorage.removeItem("chatResponseId")
    setResponseId(null)
    setMessages(doctorId ? [messages[0]] : []) // Keep initial message if doctor-specific
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {" "}
      {/* Changed min-h-screen to h-screen */}
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">
                    {doctorId ? `Book with ${doctorName}` : "Meera AI Assistant"}
                  </h1>
                  <p className="text-sm text-gray-500 truncate">
                    {doctorId ? `${doctorSpecialty} • Ready to schedule` : "Online • Ready to help"}
                  </p>
                </div>
              </div>
            </div>

            {/* Debug info - remove in production */}
            <div className="hidden md:flex items-center text-xs text-gray-400 flex-shrink-0">
              {responseId ? `Session: ${responseId.slice(-8)}` : "New Session"}
              <Button variant="ghost" size="sm" onClick={clearSession} className="ml-2 text-xs">
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Chat Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col p-6 h-full">
          <Card className="flex-1 flex flex-col min-h-0">
            

            <CardContent className="flex-1 flex flex-col min-h-0 gap-4">
            {messages.length<=0 && <CardHeader className="pb-4 flex-shrink-0">
              <CardTitle className="text-center text-gray-600 text-sm sm:text-base">
                {doctorId
                  ? `Hi! I'm here to help you schedule an appointment with ${doctorName}. Let me know your preferred date and time!`
                  : "Hi! I'm your AI assistant. I can help you book appointments, find doctors, and answer your questions."}
              </CardTitle>
            </CardHeader>}
              {" "}
              {/* Added gap-4 here */}
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                {" "}
                {/* Removed mb-4 */}
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                    <p className="text-gray-500 mb-6 text-sm sm:text-base">
                      {doctorId
                        ? `Ready to book your appointment with ${doctorName}`
                        : "Start a conversation with our AI assistant"}
                    </p>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-start bg-transparent text-xs sm:text-sm p-2 sm:p-3"
                          onClick={() => handleQuickAction(action.text)}
                        >
                          {action.icon}
                          <span className="ml-2 truncate">{action.text}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-start space-x-2 max-w-[85%] sm:max-w-md lg:max-w-lg ${
                        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user" ? "bg-emerald-600" : "bg-gray-200"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div
                        className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg break-words ${
                          message.role === "user" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc pl-5 mb-2 space-y-1 text-sm">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal pl-5 mb-2 space-y-1 text-sm">{children}</ol>
                                ),
                                li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-gray-900">{children}</strong>
                                ),
                                em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
                                code: ({ children }) => (
                                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">
                                    {children}
                                  </code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto font-mono">
                                    {children}
                                  </pre>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-base font-bold mb-2 text-gray-900">{children}</h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-sm font-bold mb-1 text-gray-900">{children}</h3>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700 my-2">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ children, href }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700 underline"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex space-x-2 flex-shrink-0">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1 text-sm sm:text-base"
                  disabled={isLoading}
                  autoComplete="off"
                />

                <Button
                  type="submit"
                  disabled={isLoading || !input || input.trim() === ""}
                  className="bg-emerald-600 hover:bg-emerald-700 flex-shrink-0"
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
