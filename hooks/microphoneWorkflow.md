🎤 Microphone
   │ (MediaStream from getUserMedia)
   ▼
Main AudioContext (audioContextRef)
   │
   ├─▶ createMediaStreamSource(stream)
   │       │
   │       ├─▶ new AudioWorkletNode(audioContextRef, "pcm-processor")
   │       │       │
   │       │       └─▶ port.onmessage → PCM data
   │       │                     │
   │       │                     └─▶ DataChannel.send() → OpenAI
   │       │
   │       └─▶ createAnalyser()
   │                │
   │                └─▶ getByteFrequencyData() → VAD / mic visualization
   │
   └─ (no direct connection to destination here — mic isn’t played back locally)

───────────────────────────────────────────────

🤖 OpenAI (via RTCPeerConnection)
   │
   ▼
Remote Audio Track (MediaStream from pc.ontrack)
   │
   ├─▶ <audio> element.srcObject = remoteStream
   │       │
   │       └─▶ (handles playback to speakers automatically)
   │
   └─▶ AI AudioContext (aiAudioContext)
           │
           ├─▶ createMediaStreamSource(remoteStream)
           │       │
           │       └─▶ createAnalyser()
           │                │
           │                └─▶ getByteFrequencyData() → detect AI speaking
           │
           └─ (no worklet — analysis only)



----------------------------------------------------
Mic Side (sending audio to OpenAI)
[Mic MediaStream] 
       │ (getUserMedia)
       ▼
[MediaStreamSourceNode]  ← (audioContextRef.createMediaStreamSource)
       │
       ├──▶ [AudioWorkletNode "pcm-processor"]  ← (new AudioWorkletNode)
       │          │
       │          └──▶ [DataChannel.send()]  ← (PCM data sent to OpenAI)
       │
       └──▶ [AnalyserNode]  ← (audioContextRef.createAnalyser)
                  │
                  └──▶ getByteFrequencyData()  ← (Mic VAD / visualization)


------------------------------------------------------
AI Side (receiving audio from OpenAI)
[Remote MediaStream]  ← (pc.ontrack)
       │
       ├──▶ [<audio> element]  ← (playback to speakers)
       │
       └──▶ [MediaStreamSourceNode]  ← (aiAudioContext.createMediaStreamSource)
                  │
                  └──▶ [AnalyserNode]  ← (aiAudioContext.createAnalyser)
                             │
                             └──▶ getByteFrequencyData()  ← (AI VAD / speaking detection)
