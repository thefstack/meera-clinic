"use client"

import { useSimpleInterview } from "@/hooks/use-simple-interview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Phone, PhoneOff, AlertCircle, CheckCircle, Clock } from "lucide-react"

export function VoiceInterview() {
  const {
    connectionStatus,
    connectionState,
    transcript,
    messages,
    isInterviewActive,
    isConnectionReady,
    permissionState,
    isAISpeaking,
    isUserSpeaking,
    isMuted,
    toggleMute,
    startInterview,
    beginInterview,
    endInterview,
    requestPermissions,
    connectionMessage,
    sessionError,
  } = useSimpleInterview()

  const getStatusColor = () => {
    switch (connectionState) {
      case "connected":
      case "verified":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "error":
      case "permission-denied":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = () => {
    switch (connectionState) {
      case "connected":
      case "verified":
        return <CheckCircle className="h-4 w-4" />
      case "connecting":
        return <Clock className="h-4 w-4" />
      case "error":
      case "permission-denied":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Voice Interview
            <Badge variant="outline" className={`${getStatusColor()} text-white`}>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                {connectionState}
              </div>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Message */}
          {connectionMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{connectionMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {sessionError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{sessionError}</p>
            </div>
          )}

          {/* Permission State */}
          {permissionState === "denied" && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Microphone access is required. Please allow permissions and try again.
              </p>
              <Button onClick={requestPermissions} className="mt-2" size="sm">
                Request Permissions
              </Button>
            </div>
          )}

          {/* Audio Status Indicators */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isUserSpeaking ? "bg-green-500" : "bg-gray-300"}`} />
              <span className="text-sm">You {isUserSpeaking ? "speaking" : "silent"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isAISpeaking ? "bg-blue-500" : "bg-gray-300"}`} />
              <span className="text-sm">AI {isAISpeaking ? "speaking" : "silent"}</span>
            </div>
          </div>

          {/* Current Transcript */}
          {transcript && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Current transcript:</p>
              <p className="text-sm text-gray-600 mt-1">{transcript}</p>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!isConnectionReady ? (
              <Button
                onClick={() => startInterview()}
                disabled={permissionState !== "granted" || connectionState === "connecting"}
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-2" />
                Connect
              </Button>
            ) : !isInterviewActive ? (
              <Button onClick={beginInterview} className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                <Button onClick={toggleMute} variant={isMuted ? "destructive" : "outline"} className="flex-1">
                  {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
                <Button onClick={endInterview} variant="destructive" className="flex-1">
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.type === "ai"
                      ? "bg-blue-50 border border-blue-200"
                      : message.type === "user"
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">
                        {message.type === "ai" ? "AI" : message.type === "user" ? "You" : "System"}
                      </p>
                      <p className="text-sm mt-1">{message.text}</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{message.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
