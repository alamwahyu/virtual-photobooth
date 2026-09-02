"use client";

import { useState } from "react";
import { Plus, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LibraryModal({
  title,
  triggerLabel,
  mode = "edit",
  children
}: {
  title: string;
  triggerLabel: string;
  mode?: "create" | "edit";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant={mode === "create" ? "primary" : "secondary"} className="px-3" onClick={() => setOpen(true)} aria-label={triggerLabel} title={triggerLabel}>
        {mode === "create" ? <Plus size={17} /> : <Settings size={16} />}
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-5">
          <section className="flex max-h-[92dvh] w-full max-w-7xl flex-col overflow-hidden rounded-lg bg-white text-ink shadow-soft">
            <div className="flex items-center justify-between gap-4 border-b border-black/10 px-4 py-3 sm:px-5 sm:py-4">
              <h2 className="min-w-0 truncate font-serif text-2xl sm:text-3xl">{title}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup modal" title="Tutup modal" className="touch-target shrink-0 rounded-full border border-black/10 bg-linen p-2">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-3 sm:p-4">
              {children}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
