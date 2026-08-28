"use client";

import { Copy } from "lucide-react";

export function CopyUrlButton({ url }: { url: string }) {
  return (
    <button type="button" onClick={() => navigator.clipboard.writeText(url)} className="inline-flex items-center gap-2 rounded-md border border-black/10 px-2 py-1 text-xs">
      <Copy size={14} />
      Copy URL
    </button>
  );
}
