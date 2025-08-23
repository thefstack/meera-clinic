import { VoiceInterview } from "@/components/voice-interview"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Interview System</h1>
          <p className="text-gray-600">AI-powered voice conversation using OpenAI's Realtime API</p>
        </div>
        <VoiceInterview />
      </div>
    </main>
  )
}
