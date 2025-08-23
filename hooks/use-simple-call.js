"use client";

import { systemInstructions } from "@/lib/systemPrompt";
import { appointmentTools, handleFunctionCall } from "@/lib/tools";
import { useState, useRef, useCallback } from "react";

export function useSimpleCall() {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [connectionState, setConnectionState] = useState("disconnected");
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const isCallActiveRef = useRef(false);
  const [permissionState, setPermissionState] = useState("not-requested");
  const [isConnectionReady, setIsConnectionReady] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [canSendAudio, setCanSendAudio] = useState(false);

  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioElementRef = useRef(null);
  const aiAudioAnalyserRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const isMutedRef = useRef(false);
  const micTrackRef = useRef(null);

  const OPENAI_WEBRTC_URL = "https://api.openai.com/v1/realtime";
  const MODEL = "gpt-4o-mini-realtime-preview-2024-12-17";
  const SILENCE_THRESHOLD = 0.01;
  const SILENCE_DURATION = 500;

  const addMessage = useCallback(
    (type, text, timestamp = new Date().toLocaleTimeString()) => {
      setMessages((prev) => [...prev, { type, text, timestamp }]);
    },
    []
  );

  // step 1: Request microphone permissions
  // This function is called when the user clicks "Request Permissions" or automatically on startCall
  const requestPermissions = useCallback(async () => {
    try {
      console.log("Requesting permissions...");
      setPermissionState("requesting");
      setConnectionMessage("Requesting microphone access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1,
        },
      });

      console.log("Permissions granted, stream obtained");
      streamRef.current = stream;
      setPermissionState("granted");
      setConnectionState("ready");
      setConnectionMessage("Permissions granted - ready to connect");
    } catch (error) {
      console.log("Permission request failed:", error);
      setPermissionState("denied");
      setConnectionState("permission-denied");
      setConnectionMessage("Microphone access denied");
      setSessionError("Please allow microphone access to start the session");
    }
  }, []);

  // step 5: Handle incoming messages from OpenAI via data channel
  const handleDataChannelMessage = useCallback(
    (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message from OpenAI:", message.type);

        switch (message.type) {
          case "session.created":
            addMessage("system", "session created successfully");
            setConnectionStatus("connected");
            setConnectionState("verified");
            setCanSendAudio(true);
            break;

          case "input_audio_buffer.speech_started":
            setIsUserSpeaking(true);
            break;

          case "input_audio_buffer.speech_stopped":
            setIsUserSpeaking(false);
            break;

          case "conversation.item.input_audio_transcription.completed":
            const newFragment = message.transcript?.trim();
            if (newFragment) {
              setTranscript(newFragment);
            }
            break;

          case "response.audio_transcript.delta":
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];

              if (
                lastMessage &&
                lastMessage.type === "ai" &&
                lastMessage.isIncomplete
              ) {
                lastMessage.text = (lastMessage.text || "") + message.delta;
              } else {
                newMessages.push({
                  type: "ai",
                  text: message.delta,
                  timestamp: new Date().toLocaleTimeString(),
                  isIncomplete: true,
                });
              }
              return newMessages;
            });
            break;

          case "response.audio_transcript.done":
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];

              if (
                lastMessage &&
                lastMessage.type === "ai" &&
                lastMessage.isIncomplete
              ) {
                lastMessage.text = message.transcript;
                lastMessage.isIncomplete = false;
              } else {
                newMessages.push({
                  type: "ai",
                  text: message.transcript,
                  timestamp: new Date().toLocaleTimeString(),
                  isIncomplete: false,
                });
              }
              return newMessages;
            });
            break;

          // case "response.function_call_arguments.delta":
          //   console.log("AI requested function call arguments delta:", message);
          //   break;

          //   case "response.function_call_arguments.done":
          // console.log("AI completed function call arguments:", message);
          // break;

          case "response.function_call_arguments.done":
            (async () => {
              try {
                console.log("AI requested function call:", message);

                if(message.name === "endCall") {
                  console.log("AI requested to end the call");
                  endCall();
                  return;
                }

                const result = await handleFunctionCall(
                  message.name,
                  JSON.parse(message.arguments)
                );

                console.log("Server resolved function call:", result);

                // Send the result back to OpenAI via data channel
                if (dataChannelRef.current?.readyState === "open") {
                  dataChannelRef.current.send(
                    JSON.stringify({
                      type: "conversation.item.create",
                      item: {
                        type: "function_call_output",
                        call_id: message.call_id,
                        output: JSON.stringify(result),
                      },
                    })
                  );

                  dataChannelRef.current.send(
          JSON.stringify({
            type: "response.create",
            response: {
              modalities: ["text", "audio"], // ensures it talks
            },
          })
        );
                }
              } catch (error) {
                console.error("Error processing function call:", error);
                setSessionError("AI function call failed");
              }
            })();
            break;

          case "error":
            console.log("AI returned an error:", message.error);
            addMessage(
              "system",
              `Error: ${message.error?.message || "Unknown error"}`
            );
            setSessionError(message.error?.message || "Unknown error occurred");
            break;
        }
      } catch (error) {
        console.log("Error processing message from AI:", error);
        addMessage("system", "Error processing message from AI");
        setSessionError("Failed to process AI response");
      }
    },
    [addMessage]
  );

  // step 3: Setup the session with OpenAI
  const setupSession = useCallback(() => {
    try {
      console.log("setupSession called - checking data channel state");

      if (
        !dataChannelRef.current ||
        dataChannelRef.current.readyState !== "open"
      ) {
        console.log(
          "Data channel not ready:",
          dataChannelRef.current?.readyState
        );
        setConnectionMessage("Waiting for data channel...");
        return;
      }

      console.log("Data channel is open, configuring AI...");
      setConnectionMessage("Configuring AI...");

      const sessionMessage = {
        type: "session.update",
        session: {
          instructions: `You are Meera, a warm and professional AI receptionist for Meera Clinic. Your role is to assist patients with appointment booking through natural conversation on call.

Core Principles:

NEVER add or assume patient details (name, phone, etc.) - always ask for them

NEVER diagnose or provide medical advice

ALWAYS call getCurrentDateAndTime() first for accurate timing

ALWAYS check today's availability before suggesting other days

Conversation Flow:

Greet warmly - "Hello! Welcome to Meera Clinic. How can I help you today?"

Understand purpose - Ask about their reason for visiting

Recommend specialty - Based on their concern, suggest appropriate specialist

Gather details - Ask for name, contact, and preferred time

Check availability - Use appropriate functions to find slots

Confirm booking - Finalize details and provide instructions

Specialty Matching:

Always call getDoctors() with the specialty first

Use returned doctorId(s) for availability checks

Never assume doctor IDs

Important Rules:

Ask only 1-2 questions at a time

Keep responses concise and friendly

Never pre-fill patient information

Always verify details before proceeding

If no slots today, then check next day

Example Proper Flow:
Patient: "I need an appointment"
You: "Hello! Welcome to Meera Clinic. What brings you in today?"
Patient: "I have back pain"
You: "I understand. For back pain, we can schedule you with our orthopedic specialist. May I know your name please?"
Patient: "Raj Sharma"
You: "Thank you, Raj. And what's the best phone number to reach you?"
[Continue gathering details before checking availability]

Always close the conversation politely.  

Before ending:  
- Ask: "Is there anything else I can help you with today?"  
- If the patient asks **another question or raises a new concern**, continue helping.  
- If the patient clearly says **no, that’s all, I’m done, thanks, bye**, or anything similar, then  then:  
   Then immediately call endCall().

`,
          voice: "sage",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1",
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.8,
            prefix_padding_ms: 500,
            silence_duration_ms: 1000,
          },
          tools: appointmentTools,
          tool_choice: "auto",
          temperature: 0.7,
          max_response_output_tokens: 500,
        },
      };

      try {
        console.log("Sending session configuration to OpenAI...");
        dataChannelRef.current.send(JSON.stringify(sessionMessage));
        console.log("Session configuration sent successfully");
        setConnectionMessage("AI configured - ready to begin");
      } catch (error) {
        console.log("Error sending session configuration:", error);
        setSessionError("Failed to configure AI");
        setConnectionMessage("Configuration failed");
      }
    } catch (error) {
      console.log("Error in setupSession:", error);
      setSessionError("Failed to setup session");
      setConnectionMessage("Setup failed");
    }
  }, []);

  // step 2: Start the call process
  const startCall = useCallback(
    async (skipPermissionCheck = false) => {
      try {
        // step 2.1: Check if we already have an active connection
        if (
          peerConnectionRef.current &&
          peerConnectionRef.current.connectionState !== "closed"
        ) {
          console.log("Active connection exists, skipping");
          return;
        }

        setSessionError("");
        setConnectionMessage("");

        const apiKey =
          process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
          localStorage.getItem("openai_api_key");
        if (!apiKey) {
          const errorMsg =
            "OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY environment variable or add 'openai_api_key' to localStorage.";
          console.log("API key error:", errorMsg);
          setSessionError(errorMsg);
          setConnectionState("error");
          setConnectionMessage("API key missing");
          return;
        }
        console.log("API key found");

        if (permissionState !== "granted") {
          console.log("Requesting permissions first...");
          await requestPermissions();
          // Wait for permissions to be processed
          if (permissionState === "denied") {
            return;
          }
        }

        setConnectionState("connecting");
        setConnectionStatus("connecting");
        setConnectionMessage("Establishing connection to assistant...");
        addMessage("system", "Starting session...");
        console.log("Starting WebRTC connection process...");

        // step 2.2: Get or create media stream for audio
        let stream = streamRef.current;
        if (!stream) {
          try {
            console.log("Requesting media stream...");
            setConnectionMessage("Accessing microphone...");
            stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 24000,
                channelCount: 1,
              },
            });
            streamRef.current = stream;
            console.log("Media stream obtained");
          } catch (error) {
            console.log("Media stream error:", error);
            const permissionError = new Error("Failed to access microphone");
            throw permissionError;
          }
        }

        // step 2.3: Create audio context and worklet processor
        try {
          console.log("Creating audio context...");
          setConnectionMessage("Setting up audio processing...");
          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)({ sampleRate: 24000 });
          console.log("Audio context created");
        } catch (error) {
          console.log("Audio context error:", error);
          throw new Error("Failed to create audio context");
        }

        try {
          console.log("Loading audio worklet...");
          setConnectionMessage("Loading audio processor...");
          await audioContextRef.current.audioWorklet.addModule(
            "/audio-processor.js"
          );
          console.log("Audio worklet loaded successfully");
        } catch (error) {
          console.log("Audio worklet load failed:", error);
          setSessionError(
            "Failed to load audio processor. Please refresh the page."
          );
          setConnectionState("error");
          setConnectionMessage("Audio processor failed");
          return;
        }

        // step 2.4: Setup audio analyser for voice activity detection
        try {
          console.log("Setting up audio analyser...");
          setConnectionMessage("Configuring audio analysis...");
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source =
            audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          analyserRef.current.fftSize = 256;
          analyserRef.current.smoothingTimeConstant = 0.8;
          console.log("Audio analyser setup complete");
        } catch (error) {
          console.log("Audio analyser error:", error);
          throw new Error("Failed to setup audio analyser");
        }

        // step 2.5: Create peer connection and data channel for WebRTC
        try {
          console.log("Creating peer connection...");
          setConnectionMessage("Creating WebRTC connection...");
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });
          peerConnectionRef.current = pc;
          console.log("Peer connection created");

          // step 2.6: Add audio track to peer connection
          const audioTrack = stream.getAudioTracks()[0];
          audioTrack.enabled = false; // Disable initially
          micTrackRef.current = audioTrack;
          console.log("Audio track disabled initially");

          pc.addTrack(audioTrack, stream);
          console.log("Audio track added to peer connection");

          // step 2.7: Create data channel for OpenAI communication
          console.log("Creating data channel...");
          const dataChannel = pc.createDataChannel("oai-events");
          dataChannelRef.current = dataChannel;
          console.log("Data channel created");

          // step 2.8: Setup data channel event listeners for sending and receiving events
          dataChannel.addEventListener("open", () => {
            try {
              console.log("Data channel opened successfully!");
              setConnectionState("verified");
              setConnectionStatus("connected");
              setIsConnectionReady(true);
              setConnectionMessage("Connected to OpenAI - ready to begin");
              addMessage("system", "Data channel established");

              // step 2.9: Setup PCM audio processor worklet
              console.log("Setting up PCM processor...");
              const pcmProcessor = new AudioWorkletNode(
                audioContextRef.current,
                "pcm-processor"
              );
              const sourceNode =
                audioContextRef.current.createMediaStreamSource(stream);
              sourceNode.connect(pcmProcessor);

              // step 2.10: Connect PCM processor to analyser for VAD
              pcmProcessor.port.onmessage = (event) => {
                if (
                  isCallActiveRef.current &&
                  canSendAudio &&
                  dataChannelRef.current?.readyState === "open"
                ) {
                  if (!isMutedRef.current && !isAISpeaking) {
                    const audioData = event.data;
                    const message = {
                      type: "input_audio_buffer.append",
                      audio: audioData,
                    };
                    dataChannelRef.current.send(JSON.stringify(message));
                  }
                }
              };

              console.log("PCM processor setup complete");
              setupSession();
            } catch (error) {
              console.log("Error in data channel open handler:", error);
              setSessionError("Failed to setup audio processing");
              setConnectionState("error");
              setConnectionMessage("Audio setup failed");
            }
          });

          // step 2.11: Handle incoming messages from OpenAI
          dataChannel.addEventListener("message", (event) => {
            try {
              handleDataChannelMessage(event);
            } catch (error) {
              console.log("Error handling data channel message:", error);
            }
          });

          dataChannel.addEventListener("error", (error) => {
            console.log("Data channel error:", error);
            addMessage("system", "Data channel error occurred");
            setSessionError("Data channel error");
          });

          dataChannel.addEventListener("close", () => {
            console.log("Data channel closed");
            setConnectionState("error");
            setConnectionMessage("Connection lost");
          });

          // step 2.12: Handle peer connection events
          pc.addEventListener("track", (event) => {
            try {
              console.log("Received audio track from OpenAI");

              if (audioElementRef.current) {
                audioElementRef.current.pause();
                audioElementRef.current.srcObject = null;
                audioElementRef.current = null;
              }

              const [remoteStream] = event.streams;
              const audioElement = new Audio();
              audioElement.srcObject = remoteStream;
              audioElement.autoplay = true;
              audioElement.volume = 1.0;
              audioElementRef.current = audioElement;
              console.log("Audio element setup complete");

              const aiAudioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
              const aiSource =
                aiAudioContext.createMediaStreamSource(remoteStream);
              const aiAnalyser = aiAudioContext.createAnalyser();
              aiAnalyser.fftSize = 256;
              aiAnalyser.smoothingTimeConstant = 0.8;
              aiSource.connect(aiAnalyser);
              aiAudioAnalyserRef.current = aiAnalyser;

              const monitorAIAudio = () => {
                if (!aiAudioAnalyserRef.current) return;

                const dataArray = new Uint8Array(
                  aiAudioAnalyserRef.current.frequencyBinCount
                );
                aiAudioAnalyserRef.current.getByteFrequencyData(dataArray);

                const average =
                  dataArray.reduce((sum, value) => sum + value, 0) /
                  dataArray.length;
                const normalizedVolume = average / 255;

                if (normalizedVolume > SILENCE_THRESHOLD) {
                  if (!isAISpeaking) {
                    setIsAISpeaking(true);
                  }
                  if (silenceTimeoutRef.current) {
                    clearTimeout(silenceTimeoutRef.current);
                    silenceTimeoutRef.current = null;
                  }
                } else {
                  if (isAISpeaking && !silenceTimeoutRef.current) {
                    silenceTimeoutRef.current = setTimeout(() => {
                      setIsAISpeaking(false);
                      silenceTimeoutRef.current = null;
                    }, SILENCE_DURATION);
                  }
                }

                requestAnimationFrame(monitorAIAudio);
              };

              // Start monitoring AI audio levels
              audioElement.addEventListener("play", () => {
                console.log("AI audio started playing");
                monitorAIAudio();
              });

              console.log("AI audio monitoring setup complete");
            } catch (error) {
              console.log("Error setting up audio track:", error);
              setSessionError("Failed to setup audio playback");
            }
          });

          // step 2.13: Handle peer connection state changes to monitor connection status
          pc.addEventListener("connectionstatechange", () => {
            console.log("Peer connection state changed:", pc.connectionState);
            if (pc.connectionState === "failed") {
              console.log("Peer connection failed");
              setConnectionState("error");
              setConnectionMessage("Connection failed");
              setSessionError("WebRTC connection failed");
            } else if (pc.connectionState === "connecting") {
              setConnectionMessage("Establishing connection...");
            } else if (pc.connectionState === "connected") {
              setConnectionMessage(" connected, waiting for data channel...");
            }
          });

          // step 2.14: Create WebRTC offer and set local description for OpenAI
          console.log("Creating offer...");
          setConnectionMessage("Creating connection ...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log("Local description set");

          // step 2.15: Send offer to OpenAI WebRTC endpoint. it is used to establish the connection
          console.log("Sending offer to OpenAI...");
          setConnectionMessage("Connecting to Assistant...");
          const response = await fetch(`${OPENAI_WEBRTC_URL}?model=${MODEL}`, {
            method: "POST",
            body: offer.sdp,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/sdp",
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `OpenAI API Error (${response.status}): ${response.statusText}`;

            if (response.status === 401) {
              errorMessage =
                "Invalid OpenAI API key. Please check your API key.";
            } else if (response.status === 429) {
              errorMessage =
                "OpenAI API rate limit exceeded. Please try again later.";
            } else if (response.status >= 500) {
              errorMessage =
                "OpenAI service temporarily unavailable. Please try again.";
            }

            console.log("OpenAI API error:", errorMessage, errorText);
            setSessionError(errorMessage);
            setConnectionState("error");
            setConnectionMessage("API connection failed");
            return;
          }

          console.log("Received response from OpenAI");
          setConnectionMessage("Processing assistant response...");
          const answerSdp = await response.text();
          const answer = { type: "answer", sdp: answerSdp };
          await pc.setRemoteDescription(answer);
          console.log("Remote description set");
          setConnectionMessage("Finalizing connection...");

          console.log("WebRTC connection setup complete!");
        } catch (error) {
          console.log("Error in WebRTC setup:", error);
          throw error;
        }
      } catch (error) {
        console.log("Critical error in startCall:", error);
        setConnectionStatus("error");
        setConnectionState("error");

        let userMessage = "Failed to establish connection";
        if (error.message.includes("API key")) {
          userMessage = "OpenAI API key issue";
        } else if (error.message.includes("microphone")) {
          userMessage = "Microphone access failed";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          userMessage = "Network connection failed";
        }

        setConnectionMessage(userMessage);
        setSessionError(error.message);
        setIsConnectionReady(false);
      }
    },
    [
      addMessage,
      handleDataChannelMessage,
      setupSession,
      permissionState,
      isAISpeaking,
      connectionStatus,
      connectionState,
      isConnectionReady,
    ]
  );

  // step 4: Begin the Call process
  const beginCall = useCallback(() => {
    try {
      console.log("beginCall called - enabling audio track");
      setIsCallActive(true);
      isCallActiveRef.current = true;

      if (micTrackRef.current) {
        micTrackRef.current.enabled = true;
        console.log("Microphone track enabled");
      }

      addMessage("system", "Session started - AI is now listening");

      if (dataChannelRef.current?.readyState === "open") {
        console.log("Sending initial greeting request...");
        const startMessage = {
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions:
              "Greet the user warmly and ask how you can help them today. Keep it brief and friendly.",
          },
        };
        dataChannelRef.current.send(JSON.stringify(startMessage));
        console.log("Initial greeting request sent");
      }
    } catch (error) {
      console.log("Error in beginCall:", error);
      setSessionError("Failed to begin session");
    }
  }, [addMessage]);

  const endCall = useCallback(() => {
    console.log("Ending Call...");
    cleanup();
  }, []);

  const cleanup = useCallback(() => {
    console.log("Starting cleanup process...");

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (aiAudioAnalyserRef.current) {
      aiAudioAnalyserRef.current = null;
    }

    setIsAISpeaking(false);
    setIsUserSpeaking(false);
    setIsCallActive(false);
    isCallActiveRef.current = false;
    setIsMuted(false);
    isMutedRef.current = false;
    setCanSendAudio(false);
    setIsConnectionReady(false);
    setConnectionStatus("disconnected");
    setConnectionState("disconnected");
    setConnectionMessage("");
    setSessionError("");
    setTranscript("");

    if (micTrackRef.current) {
      micTrackRef.current.enabled = false;
      micTrackRef.current = null;
    }

    addMessage("system", "Session ended");
    console.log("Cleanup completed - all states reset");
  }, [addMessage]);

  const toggleMute = useCallback(() => {
    console.log("toggleMute called - current isMuted:", isMuted);
    setIsMuted((prev) => {
      const newMuted = !prev;
      isMutedRef.current = newMuted;
      console.log("Mute state updated - newMuted:", newMuted);

      if (micTrackRef.current) {
        micTrackRef.current.enabled = !newMuted && isCallActiveRef.current;
        console.log("Audio track enabled state:", micTrackRef.current.enabled);
      }

      if (newMuted && dataChannelRef.current?.readyState === "open") {
        console.log("Sending input_audio_buffer.clear to OpenAI");
        const stopMessage = {
          type: "input_audio_buffer.clear",
        };
        dataChannelRef.current.send(JSON.stringify(stopMessage));
      }
      return newMuted;
    });
  }, [isMuted]);

  // useEffect(() => {
  //   if (permissionState === "pending") {
  //     requestPermissions()
  //   }
  // }, [permissionState, requestPermissions])

  return {
    connectionStatus,
    connectionState,
    transcript,
    messages,
    isCallActive,
    isConnectionReady,
    permissionState,
    isAISpeaking,
    isUserSpeaking,
    isMuted,
    toggleMute,
    startCall,
    beginCall,
    endCall,
    requestPermissions,
    connectionMessage,
    sessionError,
  };
}

/**
 * Call SYSTEM PROCESS FLOWS
 * ==============================
 *
 * This hook manages a real-time voice Call system with OpenAI's WebRTC API.
 * Below are the detailed step-by-step flows for each major process:
 *
 * 1. PERMISSION REQUEST PROCESS
 * -----------------------------
 * Step 1: User clicks "Request Permissions" or system auto-requests
 * Step 2: Set permissionState to "requesting"
 * Step 3: Call navigator.mediaDevices.getUserMedia() for audio access
 * Step 4: If granted:
 *   - Store stream in streamRef.current
 *   - Set permissionState to "granted"
 *   - Set connectionState to "ready"
 * Step 5: If denied:
 *   - Set permissionState to "denied"
 *   - Set connectionState to "permission-denied"
 *   - Show error message to user
 *
 * 2. CONNECTION ESTABLISHMENT PROCESS
 * -----------------------------------
 * Step 1: Validate API key exists (env var or localStorage)
 * Step 2: Check permissions are granted (auto-request if needed)
 * Step 3: Set connectionState to "connecting"
 * Step 4: Get or create media stream with audio constraints
 * Step 5: Create AudioContext with 24kHz sample rate
 * Step 6: Load audio worklet processor (/audio-processor.js)
 * Step 7: Setup audio analyser for voice activity detection
 * Step 8: Create RTCPeerConnection with STUN server
 * Step 9: Add audio track to peer connection (disabled initially)
 * Step 10: Create data channel for OpenAI communication
 * Step 11: Setup data channel event listeners (open, message, error, close)
 * Step 12: Setup peer connection event listeners (track, connectionstatechange)
 * Step 13: Create WebRTC offer and set local description
 * Step 14: Send offer to OpenAI WebRTC endpoint
 * Step 15: Receive answer SDP from OpenAI
 * Step 16: Set remote description with OpenAI's answer
 * Step 17: Wait for data channel to open
 * Step 18: When data channel opens:
 *   - Set connectionState to "verified"
 *   - Setup PCM audio processor worklet
 *   - Call setupSession() to configure AI
 *
 * 3. SESSION SETUP PROCESS
 * ------------------------
 * Step 1: Verify data channel is open and ready
 * Step 2: Create session configuration object with:
 *   - System instructions for AI behavior
 *   - Voice settings (sage voice)
 *   - Audio format (PCM16)
 *   - Transcription settings (Whisper-1)
 *   - Turn detection (server VAD)
 *   - Available tools and functions
 *   - Temperature and token limits
 * Step 3: Send session.update message via data channel
 * Step 4: Wait for session.created response from OpenAI
 * Step 5: Set canSendAudio to true when session is ready
 *
 * 4. Call START PROCESS
 * --------------------------
 * Step 1: User clicks "Begin Call"
 * Step 2: Set isCallActive to true
 * Step 3: Enable microphone audio track
 * Step 4: Send initial greeting request to AI
 * Step 5: AI responds with welcome message
 * Step 6: System is now ready for conversation
 *
 * 5. REAL-TIME AUDIO PROCESSING FLOW
 * -----------------------------------
 * OUTGOING AUDIO (User → AI):
 * Step 1: Microphone captures audio
 * Step 2: AudioWorklet processes raw audio to PCM16
 * Step 3: Check if Call is active and not muted
 * Step 4: Check if AI is not currently speaking
 * Step 5: Send audio chunks via data channel as input_audio_buffer.append
 * Step 6: OpenAI processes audio and detects speech start/stop
 *
 * INCOMING AUDIO (AI → User):
 * Step 1: Receive audio track from OpenAI via WebRTC
 * Step 2: Create Audio element and set srcObject to remote stream
 * Step 3: Setup audio analyser for AI speech detection
 * Step 4: Monitor audio levels to detect when AI starts/stops speaking
 * Step 5: Update isAISpeaking state based on audio activity
 * Step 6: Auto-play AI audio through speakers
 *
 * 6. MESSAGE HANDLING FLOW
 * ------------------------
 * Step 1: Receive JSON message via data channel
 * Step 2: Parse message and identify type
 * Step 3: Handle based on message type:
 *
 *   session.created:
 *   - Update connection status to "connected"
 *   - Enable audio sending
 *
 *   input_audio_buffer.speech_started:
 *   - Set isUserSpeaking to true
 *   - Visual indicator for user speaking
 *
 *   input_audio_buffer.speech_stopped:
 *   - Set isUserSpeaking to false
 *   - User finished speaking
 *
 *   conversation.item.input_audio_transcription.completed:
 *   - Update transcript with user's spoken text
 *   - Display what user said
 *
 *   response.audio_transcript.delta:
 *   - Stream AI response text in real-time
 *   - Update or create new AI message
 *
 *   response.audio_transcript.done:
 *   - Finalize AI response text
 *   - Mark message as complete
 *
 *   response.function_call:
 *   - AI wants to call a function (e.g., book appointment)
 *   - Send to server API for processing
 *   - Return result back to AI
 *
 *   error:
 *   - Handle and display error messages
 *   - Update session error state
 *
 * 7. FUNCTION CALL PROCESSING FLOW
 * --------------------------------
 * Step 1: AI determines it needs to call a function
 * Step 2: Send response.function_call message via data channel
 * Step 3: Extract function call details from message
 * Step 4: Send function call to server API (/api/resolveFunction)
 * Step 5: Server processes function (e.g., database query, booking)
 * Step 6: Server returns result
 * Step 7: Send result back to AI via response.create message
 * Step 8: AI incorporates result into conversation
 *
 * 8. MUTE/UNMUTE PROCESS
 * ----------------------
 * Step 1: User clicks mute/unmute button
 * Step 2: Toggle isMuted state
 * Step 3: Update micTrackRef.current.enabled based on mute state
 * Step 4: If muting, send input_audio_buffer.clear to stop processing
 * Step 5: Update UI to show mute status
 *
 * 9. CLEANUP PROCESS
 * ------------------
 * Step 1: Clear any active timeouts
 * Step 2: Stop and cleanup audio element
 * Step 3: Stop all media stream tracks
 * Step 4: Close audio context
 * Step 5: Close data channel
 * Step 6: Close peer connection
 * Step 7: Reset all state variables to initial values
 * Step 8: Disable microphone track
 * Step 9: Add system message about session end
 *
 * 10. ERROR HANDLING FLOW
 * -----------------------
 * Connection Errors:
 * - API key missing/invalid → Show API key error
 * - Network issues → Show connection failed
 * - WebRTC failure → Show WebRTC error
 *
 * Permission Errors:
 * - Microphone denied → Show permission error
 * - Audio context failed → Show audio setup error
 *
 * Runtime Errors:
 * - Data channel errors → Attempt reconnection
 * - Audio processing errors → Show audio error
 * - Function call errors → Show function error
 *
 * STATE TRANSITIONS
 * =================
 * connectionState flow:
 * disconnected → connecting → verified → error
 *                          ↘ ready ↗
 *
 * permissionState flow:
 * not-requested → requesting → granted
 *                           ↘ denied
 *
 * Call flow:
 * Setup → Connect → Configure → Begin → Active → End → Cleanup
 */
