"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { CameraView } from "@/components/photobooth/CameraView";
import { FrameSelector } from "@/components/photobooth/FrameSelector";
import { LayoutSelector } from "@/components/photobooth/LayoutSelector";
import { PhotoPreview } from "@/components/photobooth/PhotoPreview";
import { ResultPreview } from "@/components/photobooth/ResultPreview";
import { canvasToBlob, composePhotobooth, downloadBlob } from "@/lib/canvas/compose-photobooth";
import { formatEventDate } from "@/lib/utils/format";
import { useCamera } from "@/hooks/useCamera";
import { useCountdown } from "@/hooks/useCountdown";
import { usePhotoboothSession } from "@/hooks/usePhotoboothSession";
import type { BoothState, PublicEvent, PublicFrame, PublicLayout } from "@/types";

function filename(slug: string) {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    `${now.getMonth() + 1}`.padStart(2, "0"),
    `${now.getDate()}`.padStart(2, "0"),
    `${now.getHours()}`.padStart(2, "0"),
    `${now.getMinutes()}`.padStart(2, "0"),
    `${now.getSeconds()}`.padStart(2, "0")
  ].join("");
  return `photobooth-${slug}-${stamp}.png`;
}

export function PhotoboothApp({ event }: { event: PublicEvent }) {
  const getInitialLayout = () => {
    const savedLayout = typeof window === "undefined" ? null : sessionStorage.getItem(`awh:${event.slug}:layout`);
    return (savedLayout ? event.layouts.find((item) => item.id === savedLayout) : null) || event.layouts.find((item) => item.isDefault) || event.layouts[0];
  };
  const getInitialFrame = (selectedLayout?: PublicLayout) => {
    const savedFrame = typeof window === "undefined" ? null : sessionStorage.getItem(`awh:${event.slug}:frame`);
    return (
      (savedFrame ? event.frames.find((item) => item.id === savedFrame && item.layoutId === selectedLayout?.id) : null) ||
      event.frames.find((item) => item.layoutId === selectedLayout?.id && item.isDefault) ||
      event.frames.find((item) => item.layoutId === selectedLayout?.id)
    );
  };
  const [state, setState] = useState<BoothState>("SELECTING_LAYOUT");
  const [layout, setLayout] = useState<PublicLayout | undefined>(() => getInitialLayout());
  const [frame, setFrame] = useState<PublicFrame | undefined>(() => getInitialFrame(getInitialLayout()));
  const [photos, setPhotos] = useState<string[]>([]);
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const { videoRef, startCamera, stopCamera, switchCamera, capturePhoto, cameraError, currentFacingMode } = useCamera();
  const countdown = useCountdown(3);
  const { startSession, completeSession } = usePhotoboothSession(event.id);

  function chooseLayout(item: PublicLayout) {
    setLayout(item);
    sessionStorage.setItem(`awh:${event.slug}:layout`, item.id);
    const nextFrame = event.frames.find((candidate) => candidate.layoutId === item.id && candidate.id === frame?.id) || getInitialFrame(item);
    setFrame(nextFrame);
    if (nextFrame) sessionStorage.setItem(`awh:${event.slug}:frame`, nextFrame.id);
    setState("SELECTING_FRAME");
  }

  function chooseFrame(item: PublicFrame) {
    setFrame(item);
    sessionStorage.setItem(`awh:${event.slug}:frame`, item.id);
  }

  async function beginCamera() {
    if (!layout || !frame) return;
    setError("");
    setState("CAMERA_READY");
    await startSession(layout.id, frame.id);
    await startCamera("user");
  }

  async function runCapture() {
    if (!layout) return;
    try {
      setState("COUNTDOWN");
      await countdown.start();
      setState("CAPTURING");
      const nextPhoto = capturePhoto();
      if (retakeIndex !== null) {
        const updated = [...photos];
        updated[retakeIndex] = nextPhoto;
        setPhotos(updated);
        setRetakeIndex(null);
        stopCamera();
        setState("REVIEW");
        return;
      }
      const updated = [...photos, nextPhoto];
      setPhotos(updated);
      if (updated.length >= layout.photoCount) {
        stopCamera();
        setState("REVIEW");
      } else {
        setState("CAMERA_READY");
      }
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Gagal mengambil foto.");
      setState("ERROR");
    }
  }

  async function retake(index: number) {
    setRetakeIndex(index);
    setState("CAMERA_READY");
    await startCamera(currentFacingMode);
  }

  async function compose() {
    if (!layout || !frame) return;
    try {
      setState("COMPOSING");
      const canvas = await composePhotobooth({ event, layout, frame, photos });
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      await completeSession();
      setState("RESULT");
    } catch (composeError) {
      setError(composeError instanceof Error ? composeError.message : "Gagal menyusun fotomu.");
      setState("ERROR");
    }
  }

  async function share() {
    if (!resultBlob) return;
    const file = new File([resultBlob], filename(event.slug), { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: event.displayName });
    } else {
      downloadBlob(resultBlob, filename(event.slug));
    }
  }

  function restart() {
    stopCamera();
    setPhotos([]);
    setResultUrl("");
    setResultBlob(null);
    setRetakeIndex(null);
    setState("SELECTING_LAYOUT");
  }

  const pose = retakeIndex !== null ? retakeIndex + 1 : photos.length + 1;

  return (
    <main className="min-h-screen px-5 py-8" style={{ backgroundColor: event.backgroundColor, color: event.textColor }}>
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: event.primaryColor }}>Photobooth</p>
            {event.theme && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: event.primaryColor }}>{event.theme}</p>}
            <h1 className="mt-1 font-serif text-5xl">{event.displayName}</h1>
          </div>
          <div className="text-sm opacity-70">{formatEventDate(event.eventDate)} · {event.venueName}</div>
        </header>

        {(state === "SELECTING_LAYOUT" || state === "SELECTING_FRAME") && (
          <div className="space-y-10">
            <LayoutSelector layouts={event.layouts} selectedId={layout?.id} onSelect={chooseLayout} />
            {layout && <FrameSelector frames={event.frames} layoutId={layout.id} selectedId={frame?.id} onSelect={chooseFrame} />}
            <div className="rounded-lg border border-black/10 bg-white/70 p-5 shadow-soft">
              <p className="text-sm text-black/65">Foto diproses langsung di perangkatmu. Kamera hanya digunakan selama sesi photobooth berlangsung.</p>
              <button type="button" disabled={!layout || !frame} onClick={beginCamera} className="mt-4 touch-target rounded-md bg-ink px-6 py-3 font-semibold text-white disabled:opacity-50">
                <Camera className="mr-2 inline" size={19} />
                Mulai Foto
              </button>
              {cameraError && <p className="mt-3 text-sm text-red-700">{cameraError}</p>}
            </div>
          </div>
        )}

        {(state === "CAMERA_READY" || state === "COUNTDOWN" || state === "CAPTURING") && layout && (
          <CameraView
            title={event.displayName}
            pose={pose}
            total={layout.photoCount}
            videoRef={videoRef}
            countdown={countdown.value}
            mirrored={currentFacingMode === "user"}
            onCapture={runCapture}
            onFlip={switchCamera}
            onCancel={() => { stopCamera(); setState("SELECTING_FRAME"); }}
            disabled={state === "COUNTDOWN" || state === "CAPTURING"}
          />
        )}

        {state === "REVIEW" && (
          <section className="space-y-5">
            <h2 className="font-serif text-4xl">Review pose</h2>
            <PhotoPreview photos={photos} retaking={retakeIndex !== null} onRetake={retake} />
            <button type="button" onClick={compose} className="touch-target rounded-md bg-ink px-6 py-3 font-semibold text-white">Gunakan Foto Ini</button>
          </section>
        )}

        {state === "COMPOSING" && <div className="rounded-lg bg-white p-6 shadow-soft">Menyusun fotomu...</div>}
        {state === "RESULT" && resultUrl && resultBlob && <ResultPreview imageUrl={resultUrl} onDownload={() => downloadBlob(resultBlob, filename(event.slug))} onRestart={restart} onShare={share} />}
        {state === "ERROR" && <div className="rounded-lg bg-white p-6 text-red-700 shadow-soft">{error || cameraError}</div>}
      </div>
    </main>
  );
}
