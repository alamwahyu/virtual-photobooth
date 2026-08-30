"use client";

import { useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
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

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function captureSuccessMessage(pose: number, total: number) {
  if (pose >= total) return "Pose terakhir tersimpan. Siap melihat hasilmu.";
  const messages = [
    "Pose tersimpan. Lanjut gaya berikutnya.",
    "Cakep. Ambil pose berikutnya.",
    "Foto masuk. Siapkan ekspresi selanjutnya.",
    "Mantap. Satu lagi kenangan tersimpan."
  ];
  return messages[(pose - 1) % messages.length];
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
  const [captureMessage, setCaptureMessage] = useState("");
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
    setState("READY_TO_START");
  }

  async function beginCamera() {
    if (!layout || !frame) return;
    setError("");
    setCaptureMessage("");
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
        setCaptureMessage("Pose berhasil diganti.");
        await wait(850);
        setCaptureMessage("");
        setRetakeIndex(null);
        stopCamera();
        setState("REVIEW");
        return;
      }
      const updated = [...photos, nextPhoto];
      setPhotos(updated);
      setCaptureMessage(captureSuccessMessage(updated.length, layout.photoCount));
      await wait(850);
      setCaptureMessage("");
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
    setCaptureMessage("");
    setState("CAMERA_READY");
    await startCamera(currentFacingMode);
  }

  async function retryCamera() {
    setCaptureMessage("");
    await startCamera(currentFacingMode);
  }

  async function compose() {
    if (!layout || !frame) return;
    try {
      setState("COMPOSING");
      setError("");
      const canvas = await composePhotobooth({ event, layout, frame, photos });
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      await completeSession();
      await wait(1800);
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
    setCaptureMessage("");
    setState("SELECTING_LAYOUT");
  }

  const pose = retakeIndex !== null ? retakeIndex + 1 : photos.length + 1;

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-5 sm:px-5 sm:py-8" style={{ backgroundColor: event.backgroundColor, color: event.textColor }}>
      <div className="mx-auto max-w-6xl space-y-7 sm:space-y-10">
        <header className="flex flex-col justify-between gap-3 border-b border-black/10 pb-5 md:flex-row md:items-end md:gap-4 md:pb-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.24em]" style={{ color: event.primaryColor }}>Photobooth</p>
            {event.theme && <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.18em]" style={{ color: event.primaryColor }}>{event.theme}</p>}
            <h1 className="mt-1 break-words font-serif text-4xl leading-none sm:text-5xl">{event.displayName}</h1>
          </div>
          <div className="text-sm leading-relaxed opacity-70 md:text-right">{formatEventDate(event.eventDate)} · {event.venueName}</div>
        </header>

        {state === "SELECTING_LAYOUT" && (
          <div className="space-y-5">
            <StepHeader step={1} title="Pilih tata letak" description="Tentukan jumlah dan susunan pose yang ingin dipakai." />
            <LayoutSelector layouts={event.layouts} selectedId={layout?.id} onSelect={chooseLayout} />
          </div>
        )}

        {state === "SELECTING_FRAME" && layout && (
          <div className="space-y-5">
            <StepHeader step={2} title="Pilih bingkai" description={`${layout.name} · ${layout.photoCount} pose`} onBack={() => setState("SELECTING_LAYOUT")} />
            <FrameSelector frames={event.frames} layoutId={layout.id} selectedId={frame?.id} onSelect={chooseFrame} />
          </div>
        )}

        {state === "READY_TO_START" && layout && frame && (
          <section className="mx-auto max-w-xl space-y-5 rounded-lg border border-black/10 bg-white/75 p-5 text-center shadow-soft sm:p-6">
            <StepHeader step={3} title="Siap mulai foto" description={`${layout.name} · ${frame.name}`} onBack={() => setState("SELECTING_FRAME")} centered />
            <p className="text-sm leading-relaxed text-black/65">Foto diproses langsung di perangkatmu. Kamera hanya digunakan selama sesi photobooth berlangsung.</p>
            <button type="button" onClick={beginCamera} className="touch-target w-full rounded-md bg-ink px-6 py-3 font-semibold text-white">
              <Camera className="mr-2 inline" size={19} />
              Mulai Foto
            </button>
            {cameraError && <p className="text-sm text-red-700">{cameraError}</p>}
          </section>
        )}

        {(state === "CAMERA_READY" || state === "COUNTDOWN" || state === "CAPTURING") && layout && (
          <CameraView
            title={event.displayName}
            pose={pose}
            total={layout.photoCount}
            videoRef={videoRef}
            countdown={countdown.value}
            mirrored={currentFacingMode === "user"}
            captureMessage={captureMessage}
            cameraError={cameraError}
            onCapture={runCapture}
            onFlip={switchCamera}
            onCancel={() => { stopCamera(); setState("READY_TO_START"); }}
            onRetry={retryCamera}
            disabled={state === "COUNTDOWN" || state === "CAPTURING"}
          />
        )}

        {state === "REVIEW" && (
          <section className="space-y-5">
            <h2 className="font-serif text-3xl sm:text-4xl">Review pose</h2>
            <PhotoPreview photos={photos} retaking={retakeIndex !== null} onRetake={retake} />
            <button type="button" onClick={compose} className="touch-target w-full rounded-md bg-ink px-6 py-3 font-semibold text-white sm:w-auto">Gunakan Foto Ini</button>
          </section>
        )}

        {state === "COMPOSING" && <PrintComposer imageUrl={resultUrl} />}
        {state === "RESULT" && resultUrl && resultBlob && <ResultPreview imageUrl={resultUrl} onDownload={() => downloadBlob(resultBlob, filename(event.slug))} onRestart={restart} onShare={share} />}
        {state === "ERROR" && <div className="rounded-lg bg-white p-6 text-red-700 shadow-soft">{error || cameraError}</div>}
      </div>
    </main>
  );
}

function StepHeader({
  step,
  title,
  description,
  onBack,
  centered = false
}: {
  step: number;
  title: string;
  description: string;
  onBack?: () => void;
  centered?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${centered ? "flex-col items-center" : "items-start justify-between"}`}>
      <div className={centered ? "text-center" : "min-w-0"}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Step {step} dari 3</p>
        <h2 className="mt-1 break-words font-serif text-3xl leading-tight sm:text-4xl">{title}</h2>
        <p className="mt-1 text-sm text-black/60">{description}</p>
      </div>
      {onBack && (
        <button type="button" onClick={onBack} aria-label="Kembali" className="touch-target shrink-0 rounded-full border border-black/10 bg-white/80 p-3 shadow-sm">
          <ArrowLeft size={20} />
        </button>
      )}
    </div>
  );
}

function PrintComposer({ imageUrl }: { imageUrl: string }) {
  return (
    <section className="mx-auto max-w-xl rounded-lg border border-black/10 bg-white/85 p-6 text-center shadow-soft">
      <div className="photobooth-printer" aria-hidden="true">
        <div className="photobooth-printer__body">
          <div className="photobooth-printer__lights">
            <span />
            <span />
            <span />
          </div>
          <div className="photobooth-printer__slot" />
        </div>
        <div key={imageUrl || "loading"} className="photobooth-printer__paper">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" />
          ) : (
            <div className="photobooth-printer__placeholder">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      </div>
      <p className="mt-6 font-serif text-3xl text-ink">Menyusun fotomu...</p>
      <p className="mt-2 text-sm text-black/60">Hasil photobooth sedang dicetak.</p>
    </section>
  );
}
