Mic → OpenAI (sending side)

[Mic MediaStream] 
       │ (getUserMedia)
       ▼
[MediaStreamSourceNode]   (audioContextRef.createMediaStreamSource)
       │
       ├──▶ [AudioWorkletNode "pcm-processor"]   (new AudioWorkletNode)
       │          │
       │          └──▶ [DataChannel.send()]  ──────────────▶ [OpenAI RTC DataChannel]
       │                          (PCM audio chunks)
       │
       └──▶ [AnalyserNode]  (audioContextRef.createAnalyser)
                  │
                  └──▶ getByteFrequencyData() → Mic VAD
       
       
[Mic AudioTrack]  (stream.getAudioTracks()[0])
       │
       └──▶ pc.addTrack(audioTrack, stream) ───────────────▶ [OpenAI RTC PeerConnection]

---------------------------------------------------------

OpenAI → You (receiving side)

[OpenAI RTC PeerConnection] 
       │
       ▼
[Remote AudioTrack(s)]
       │
       ▼
[Remote MediaStream]  (event.streams[0])
       │
       ├──▶ [<audio> element]   (playback to speakers)
       │
       └──▶ [MediaStreamSourceNode]   (aiAudioContext.createMediaStreamSource)
                  │
                  └──▶ [AnalyserNode]   (aiAudioContext.createAnalyser)
                             │
                             └──▶ getByteFrequencyData() → AI VAD (detect speaking)
