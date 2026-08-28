"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FacingMode = "user" | "environment";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<FacingMode>("user");
  const [cameraError, setCameraError] = useState("");
  const [cameraPermission, setCameraPermission] = useState<"idle" | "granted" | "denied">("idle");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(
    async (facingMode: FacingMode = currentFacingMode) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Browser ini tidak mendukung akses kamera.");
        setCameraPermission("denied");
        return;
      }

      try {
        stopCamera();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        streamRef.current = stream;
        setCurrentFacingMode(facingMode);
        setCameraPermission("granted");
        setCameraError("");
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setCameraPermission("denied");
        setCameraError("Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan pada browser.");
      }
    },
    [currentFacingMode, stopCamera]
  );

  const switchCamera = useCallback(async () => {
    const next = currentFacingMode === "user" ? "environment" : "user";
    await startCamera(next);
  }, [currentFacingMode, startCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      throw new Error("Kamera belum siap mengambil foto.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas tidak didukung browser.");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  return { videoRef, startCamera, stopCamera, switchCamera, capturePhoto, cameraPermission, cameraError, currentFacingMode };
}
