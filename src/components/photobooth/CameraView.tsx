"use client";

import type { CSSProperties } from "react";
import { AlertTriangle, Camera, RefreshCw, X } from "lucide-react";
import { Countdown } from "@/components/photobooth/Countdown";

export function CameraView({
  title,
  pose,
  total,
  videoRef,
  countdown,
  mirrored,
  guideAspect,
  captureMessage,
  cameraError,
  onCapture,
  onFlip,
  onCancel,
  onRetry,
  disabled
}: {
  title: string;
  pose: number;
  total: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  countdown: number | null;
  mirrored: boolean;
  guideAspect: number;
  captureMessage?: string;
  cameraError?: string;
  onCapture: () => void;
  onFlip: () => void;
  onCancel: () => void;
  onRetry: () => void;
  disabled?: boolean;
}) {
  const safeGuideAspect = Number.isFinite(guideAspect) && guideAspect > 0 ? guideAspect : 3 / 4;

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

      {!cameraError && (
        <div className="photobooth-camera__guide" style={{ "--guide-aspect": safeGuideAspect } as CSSProperties}>
          <div className="photobooth-camera__guide-corner photobooth-camera__guide-corner--tl" />
          <div className="photobooth-camera__guide-corner photobooth-camera__guide-corner--tr" />
          <div className="photobooth-camera__guide-corner photobooth-camera__guide-corner--bl" />
          <div className="photobooth-camera__guide-corner photobooth-camera__guide-corner--br" />
          <div className="photobooth-camera__guide-label">Area hasil frame</div>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-x-4 top-1/2 z-30 mx-auto max-w-md -translate-y-1/2 rounded-lg border border-white/15 bg-black/70 p-5 text-center shadow-soft backdrop-blur">
          <AlertTriangle className="mx-auto text-white" size={34} />
          <h2 className="mt-3 font-serif text-3xl">Kamera tidak bisa diakses</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/78">{cameraError}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={onRetry} className="touch-target rounded-md bg-white px-5 font-semibold text-black">
              Coba Lagi
            </button>
            <button type="button" onClick={onCancel} className="touch-target rounded-md border border-white/25 bg-white/10 px-5 font-semibold text-white">
              Kembali
            </button>
          </div>
        </div>
      )}

      {captureMessage && (
        <div key={captureMessage} className="photobooth-camera__toast">
          {captureMessage}
        </div>
      )}

      <div className="photobooth-camera__progress flex items-center justify-center gap-3 px-4">
        {Array.from({ length: total }).map((_, index) => (
          <span key={index} className={`h-2.5 w-2.5 rounded-full ${index < pose - 1 ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>

      <div className="photobooth-camera__action flex justify-center px-4">
        <button type="button" aria-label="Ambil foto" disabled={disabled || Boolean(cameraError)} onClick={onCapture} className="photobooth-camera__capture touch-target rounded-full bg-white text-black shadow-soft disabled:opacity-60">
          <Camera size={30} strokeWidth={2.35} />
        </button>
      </div>
    </div>
  );
}
