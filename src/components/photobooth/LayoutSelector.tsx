"use client";

import type { PublicLayout } from "@/types";

export function LayoutSelector({ layouts, selectedId, onSelect }: { layouts: PublicLayout[]; selectedId?: string; onSelect: (layout: PublicLayout) => void }) {
  if (!layouts.length) return <p className="rounded-md bg-white/70 p-4 text-sm">Tidak ada tata letak yang tersedia.</p>;
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-3xl">Pilih tata letak</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            type="button"
            onClick={() => onSelect(layout)}
            className={`rounded-lg border bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 ${
              selectedId === layout.id ? "border-gold ring-2 ring-gold/30" : "border-black/10"
            }`}
          >
            <div className="mb-4 grid h-40 gap-1 rounded-md bg-linen p-2" style={{ gridTemplateRows: `repeat(${Math.min(layout.photoCount, 4)}, 1fr)` }}>
              {Array.from({ length: layout.photoCount }).map((_, index) => (
                <div key={index} className="flex items-center justify-center rounded border border-dashed border-gold/60 bg-white/80 text-xs text-black/50">
                  Foto {index + 1}
                </div>
              ))}
            </div>
            <div className="font-semibold">{layout.name}</div>
            <p className="mt-1 text-sm text-black/60">{layout.description}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-gold">{layout.photoCount} pose</p>
          </button>
        ))}
      </div>
    </section>
  );
}
