"use client";

import { Camera, RefreshCw, X } from "lucide-react";
import { Countdown } from "@/components/photobooth/Countdown";

export function CameraView({
  title,
  pose,
  total,
  videoRef,
  countdown,
  mirrored,
  onCapture,
  onFlip,
  onCancel,
  disabled
}: {
  title: string;
  pose: number;
  total: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  countdown: number | null;
  mirrored: boolean;
  onCapture: () => void;
  onFlip: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="photobooth-camera fixed inset-0 z-50 bg-black text-white">
      <video ref={videoRef} playsInline muted className={`photobooth-camera__video ${mirrored ? "-scale-x-100" : ""}`} />
      <div className="photobooth-camera__shade-top" />
      <div className="photobooth-camera__shade-bottom" />

      <div className="photobooth-camera__top flex items-center justify-between gap-3 px-4">
        <button type="button" aria-label="Batalkan sesi" onClick={onCancel} className="touch-target rounded-full bg-black/35 p-3 backdrop-blur">
          <X size={22} />
        </button>
        <div className="min-w-0 text-center">
          <div className="truncate font-serif text-lg sm:text-xl">{title}</div>
          <div className="text-sm text-white/70">Pose {pose} dari {total}</div>
        </div>
        <button type="button" aria-label="Balik kamera" onClick={onFlip} className="touch-target rounded-full bg-black/35 p-3 backdrop-blur">
          <RefreshCw size={22} />
        </button>
      </div>

      <div className="photobooth-camera__countdown">
        <Countdown value={countdown} />
      </div>

      <div className="photobooth-camera__progress flex items-center justify-center gap-3 px-4">
        {Array.from({ length: total }).map((_, index) => (
          <span key={index} className={`h-2.5 w-2.5 rounded-full ${index < pose - 1 ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>

      <div className="photobooth-camera__action flex justify-center px-4">
        <button type="button" aria-label="Ambil foto" disabled={disabled} onClick={onCapture} className="photobooth-camera__capture touch-target rounded-full bg-white text-black shadow-soft disabled:opacity-60">
          <Camera size={30} strokeWidth={2.35} />
        </button>
      </div>
    </div>
  );
}
