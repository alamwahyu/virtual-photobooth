"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FacingMode = "user" | "environment";

function cameraAccessMessage(error: unknown) {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "Kamera hanya bisa dibuka melalui HTTPS atau localhost. Silakan buka link photobooth dari domain HTTPS.";
  }

  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "Izin kamera ditolak. Aktifkan permission Camera untuk situs ini di pengaturan browser, lalu coba lagi.";
    }
    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      return "Kamera tidak ditemukan di perangkat ini, atau kamera yang diminta tidak tersedia.";
    }
    if (error.name === "NotReadableError" || error.name === "AbortError") {
      return "Kamera sedang tidak bisa dipakai. Tutup aplikasi lain yang memakai kamera, lalu coba lagi.";
    }
  }

  return "Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan pada browser.";
}

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
        setCameraError("Browser ini tidak mendukung akses kamera, atau halaman tidak dibuka melalui HTTPS.");
        setCameraPermission("denied");
        return false;
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
        return true;
      } catch (error) {
        setCameraPermission("denied");
        setCameraError(cameraAccessMessage(error));
        return false;
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
