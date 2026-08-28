"use client";

import { assetPath } from "@/lib/utils/base-path";
import type { PublicFrame } from "@/types";

export function FrameSelector({ frames, layoutId, selectedId, onSelect }: { frames: PublicFrame[]; layoutId?: string; selectedId?: string; onSelect: (frame: PublicFrame) => void }) {
  const compatible = frames.filter((frame) => !layoutId || frame.layoutId === layoutId);
  if (!compatible.length) return <p className="rounded-md bg-white/70 p-4 text-sm">Tidak ada bingkai yang tersedia.</p>;
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-3xl">Pilih bingkai</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {compatible.map((frame) => (
          <button
            key={frame.id}
            type="button"
            onClick={() => onSelect(frame)}
            className={`rounded-lg border bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 ${
              selectedId === frame.id ? "border-gold ring-2 ring-gold/30" : "border-black/10"
            }`}
          >
            <div className="mb-4 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md border border-black/10" style={{ backgroundColor: frame.backgroundColor }}>
              {frame.previewImage ? <img alt="" src={assetPath(frame.previewImage)} className="h-full w-full object-cover" /> : <span className="font-serif text-2xl opacity-70">A & G</span>}
            </div>
            <div className="font-semibold">{frame.name}</div>
            <p className="mt-1 text-sm text-black/60">Dynamic text, transparent overlay ready.</p>
          </button>
        ))}
      </div>
    </section>
  );
}
