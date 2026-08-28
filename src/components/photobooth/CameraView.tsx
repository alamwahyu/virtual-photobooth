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
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <button type="button" aria-label="Batalkan sesi" onClick={onCancel} className="touch-target rounded-full bg-white/10 p-3">
          <X size={22} />
        </button>
        <div className="text-center">
          <div className="font-serif text-xl">{title}</div>
          <div className="text-sm text-white/70">Pose {pose} dari {total}</div>
        </div>
        <button type="button" aria-label="Balik kamera" onClick={onFlip} className="touch-target rounded-full bg-white/10 p-3">
          <RefreshCw size={22} />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <video ref={videoRef} playsInline muted className={`max-h-full w-full object-cover md:h-[calc(100vh-160px)] md:w-auto md:rounded-lg ${mirrored ? "-scale-x-100" : ""}`} />
        <Countdown value={countdown} />
      </div>
      <div className="flex items-center justify-center gap-4 px-4 py-5">
        {Array.from({ length: total }).map((_, index) => (
          <span key={index} className={`h-2.5 w-2.5 rounded-full ${index < pose - 1 ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>
      <div className="flex justify-center px-4 pb-7">
        <button type="button" disabled={disabled} onClick={onCapture} className="touch-target rounded-full bg-white px-7 py-4 font-semibold text-black shadow-soft disabled:opacity-60">
          <Camera className="mr-2 inline" size={22} />
          Capture
        </button>
      </div>
    </div>
  );
}
