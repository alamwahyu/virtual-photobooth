"use client";

import { Download, RotateCcw, Share2 } from "lucide-react";

export function ResultPreview({ imageUrl, onDownload, onRestart, onShare }: { imageUrl: string; onDownload: () => void; onRestart: () => void; onShare: () => void }) {
  return (
    <section className="space-y-4 text-center sm:space-y-5">
      <h2 className="font-serif text-3xl sm:text-4xl">Hasil photobooth</h2>
      <img src={imageUrl} alt="Hasil akhir photobooth" className="mx-auto max-h-[62dvh] max-w-full rounded-lg bg-white shadow-soft sm:max-h-[70vh]" />
      <div className="mx-auto grid max-w-xl gap-2 rounded-lg border border-black/10 bg-white/70 p-4 text-sm leading-relaxed text-black/65">
        <p>Foto diproses di perangkatmu dan tidak dikirim ke server.</p>
        <p className="font-serif text-xl text-ink">Simpan untuk dikenang di hari-hari nanti</p>
      </div>
      <div className="grid gap-3 sm:flex sm:flex-wrap sm:justify-center">
        <button type="button" aria-label="Download photo" title="Download photo" onClick={onDownload} className="touch-target inline-flex items-center justify-center rounded-md bg-ink px-4 text-white">
          <Download size={18} />
        </button>
        <button type="button" aria-label="Share" title="Share" onClick={onShare} className="touch-target inline-flex items-center justify-center rounded-md border border-black/15 bg-white px-4">
          <Share2 size={18} />
        </button>
        <button type="button" aria-label="Ulangi foto" title="Ulangi foto" onClick={onRestart} className="touch-target inline-flex items-center justify-center rounded-md border border-black/15 bg-white px-4">
          <RotateCcw size={18} />
        </button>
      </div>
    </section>
  );
}
