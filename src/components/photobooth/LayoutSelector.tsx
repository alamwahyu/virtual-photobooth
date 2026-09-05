"use client";

import { ExactLayoutPreview } from "@/components/admin/CanvasPreview";
import type { PublicLayout } from "@/types";

export function LayoutSelector({ layouts, selectedId, onSelect }: { layouts: PublicLayout[]; selectedId?: string; onSelect: (layout: PublicLayout) => void }) {
  if (!layouts.length) return <p className="rounded-md bg-white/70 p-4 text-sm">Tidak ada tata letak yang tersedia.</p>;
  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            type="button"
            onClick={() => onSelect(layout)}
            className={`min-w-0 rounded-lg border bg-white p-3 text-left shadow-soft transition hover:-translate-y-0.5 sm:p-4 ${
              selectedId === layout.id ? "border-gold ring-2 ring-gold/30" : "border-black/10"
            }`}
          >
            <ExactLayoutPreview layout={layout} className="mb-3 sm:mb-4" />
            <div className="break-words text-sm font-semibold sm:text-base">{layout.name}</div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-black/60 sm:text-sm">{layout.description}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-gold">{layout.photoCount} pose</p>
          </button>
        ))}
      </div>
    </section>
  );
}
