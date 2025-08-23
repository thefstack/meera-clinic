───────────────────────────────
1. GET MIC INPUT
───────────────────────────────
navigator.mediaDevices.getUserMedia({ audio: true })
        │
        ▼
[Mic MediaStream]
        │
        ├─ save audioTrack = stream.getAudioTracks()[0]
        │      │
        │      └── pc.addTrack(audioTrack, stream)
        │               │
        │               └──────▶ (to OpenAI PeerConnection)
        │
        └─ build Web Audio Graph #1 (Mic)
               │
               ▼
    audioContextRef = new AudioContext({ sampleRate: 24000 })
               │
               ▼
    [MediaStreamSourceNode]  (mic)
               │
               ├──▶ [AudioWorkletNode "pcm-processor"]
               │          │
               │          └── pcmProcessor.port.onmessage
               │                     │
               │                     └── DataChannel.send({ type:"input_audio_buffer.append", audio: pcmData })
               │
               └──▶ [AnalyserNode] (mic VAD)
                          │
                          └── getByteFrequencyData() → detect mic activity


───────────────────────────────
2. SETUP PEER CONNECTION
───────────────────────────────
pc = new RTCPeerConnection({ iceServers:[{ urls:"stun:stun.l.google.com:19302"}] })
        │
        ├─ pc.addTrack(audioTrack, stream)  → send mic track to OpenAI
        │
        ├─ pc.createDataChannel("oai-events") → dataChannelRef
        │         │
        │         ├─ "open"   → setupSession(), start PCM sending
        │         ├─ "message"→ handleDataChannelMessage(event)
        │         ├─ "error"  → log error
        │         └─ "close"  → handle disconnect
        │
        └─ pc.ontrack = (event) => {
                  remoteStream = event.streams[0]

                  ┌──▶ [<audio> element] (playback AI audio)
                  │
                  └──▶ build Web Audio Graph #2 (AI)
                          │
                          ▼
                  aiAudioContext = new AudioContext()
                          │
                          ▼
                  [MediaStreamSourceNode] (remoteStream)
                          │
                          └──▶ [AnalyserNode] (AI VAD)
                                    │
                                    └── getByteFrequencyData() → detect AI speaking
        }


───────────────────────────────
3. SPEAKING DETECTION
───────────────────────────────
- Mic AnalyserNode → is user speaking?
- AI AnalyserNode  → is AI speaking?

Rules:
- If AI is speaking → pause mic sending (avoid echo).
- If silence detected → unmute mic again.

───────────────────────────────
4. DATA CHANNEL FLOW
───────────────────────────────
Mic PCM chunks ───────▶ DataChannel (input_audio_buffer.append) ───────▶ OpenAI Realtime API
OpenAI messages ─────▶ DataChannel.onmessage → handleDataChannelMessage()
