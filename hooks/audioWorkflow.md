🎤 Microphone
   │ (MediaStream)
   ▼
Main AudioContext (audioContextRef)
   │
   ├─▶ createMediaStreamSource(stream)
   │       │
   │       ├─▶ AudioWorkletNode ("pcm-processor")
   │       │       │
   │       │       └─▶ port.onmessage → PCM data
   │       │                     │
   │       │                     └─▶ DataChannel → OpenAI (send mic audio)
   │       │
   │       └─▶ AnalyserNode (mic VAD / visualization)
   │
   └─ (no direct playback here)

───────────────────────────────────────────────

🤖 OpenAI (via WebRTC PeerConnection)
   │
   ▼
Remote Audio Track (MediaStream)
   │
   ├─▶ <audio> element (autoplay → speakers)  
   │
   └─▶ AI AudioContext (aiAudioContext)
           │
           ├─▶ createMediaStreamSource(remoteStream)
           │       │
           │       └─▶ AnalyserNode (AI VAD)
           │                  │
           │                  └─▶ Detect if AI is speaking
           │                          (pause mic sending to avoid echo)
           │
           └─ (no worklet here, just analysis)
