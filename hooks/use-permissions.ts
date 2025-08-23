"use client"

import { useState, useCallback } from "react"

export function usePermissions() {
  const [permissionState, setPermissionState] = useState<"not-requested" | "requesting" | "granted" | "denied">(
    "not-requested",
  )
  const [errorMessage, setErrorMessage] = useState<string>("")

  const requestPermissions = useCallback(async () => {
    try {
      console.log("[v0] Requesting microphone permissions...")
      setPermissionState("requesting")
      setErrorMessage("")

      if (
        typeof window !== "undefined" &&
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        throw new Error("HTTPS required for microphone access")
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1,
        },
      })

      console.log("[v0] Microphone permissions granted")
      setPermissionState("granted")

      // Stop the stream immediately since we only needed it for permission check
      stream.getTracks().forEach((track) => track.stop())

      return true
    } catch (error) {
      console.log("[v0] Microphone permission denied:", error)
      setPermissionState("denied")

      if (error.name === "NotAllowedError") {
        setErrorMessage(
          "Microphone access was denied. Please click the microphone icon in your browser's address bar and allow access, then try again.",
        )
      } else if (error.name === "NotFoundError") {
        setErrorMessage("No microphone found. Please connect a microphone and try again.")
      } else if (error.name === "NotSupportedError") {
        setErrorMessage(
          "Your browser doesn't support microphone access. Please use a modern browser like Chrome, Firefox, or Safari.",
        )
      } else if (error.message === "HTTPS required for microphone access") {
        setErrorMessage("Voice calls require a secure connection (HTTPS). Please access this site using HTTPS.")
      } else {
        setErrorMessage("Unable to access microphone. Please check your browser settings and try again.")
      }

      return false
    }
  }, [])

  return {
    permissionState,
    requestPermissions,
    errorMessage, // Return error message for better UI feedback
  }
}
