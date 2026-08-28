"use client";

import { useRouter } from "next/navigation";
import { appPath } from "@/lib/utils/base-path";

export function DeleteButton({ endpoint, label }: { endpoint: string; label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-red-700"
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
      {label}
    </button>
  );
}
