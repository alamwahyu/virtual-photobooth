"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { appPath } from "@/lib/utils/base-path";

export function DeleteButton({ endpoint, label }: { endpoint: string; label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label={`Hapus ${label}`}
      title={`Hapus ${label}`}
      className="touch-target inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 transition hover:bg-red-100"
      onClick={async () => {
        if (!window.confirm(`Hapus ${label}?`)) return;
        const response = await fetch(appPath(endpoint), { method: "DELETE" });
        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: "Gagal menghapus." }));
          alert(data.error);
          return;
        }
        router.refresh();
      }}
    >
      <Trash2 size={17} />
    </button>
  );
}
