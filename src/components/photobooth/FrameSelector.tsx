"use client";

import { assetPath } from "@/lib/utils/base-path";
import type { PublicFrame } from "@/types";

export function FrameSelector({ frames, layoutId, selectedId, onSelect }: { frames: PublicFrame[]; layoutId?: string; selectedId?: string; onSelect: (frame: PublicFrame) => void }) {
  const compatible = frames.filter((frame) => !layoutId || frame.layoutId === layoutId);
  if (!compatible.length) return <p className="rounded-md bg-white/70 p-4 text-sm">Tidak ada bingkai yang tersedia.</p>;
  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {compatible.map((frame) => (
          <button
            key={frame.id}
            type="button"
            onClick={() => onSelect(frame)}
            className={`min-w-0 rounded-lg border bg-white p-3 text-left shadow-soft transition hover:-translate-y-0.5 sm:p-4 ${
              selectedId === frame.id ? "border-gold ring-2 ring-gold/30" : "border-black/10"
            }`}
          >
            <div className="mb-3 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md border border-black/10 bg-cover bg-center sm:mb-4" style={{ backgroundColor: frame.backgroundColor, backgroundImage: frame.backgroundImage ? `url(${assetPath(frame.backgroundImage)})` : undefined }}>
              {frame.previewImage ? <img alt="" src={assetPath(frame.previewImage)} className="h-full w-full object-cover" /> : <span className="font-serif text-xl opacity-70 sm:text-2xl">A & G</span>}
            </div>
            <div className="break-words text-sm font-semibold sm:text-base">{frame.name}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
