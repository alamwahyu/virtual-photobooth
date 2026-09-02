"use client";

import { Copy } from "lucide-react";

export function CopyUrlButton({ url }: { url: string }) {
  return (
    <button type="button" aria-label="Copy URL" title="Copy URL" onClick={() => navigator.clipboard.writeText(url)} className="inline-flex items-center justify-center rounded-md border border-black/10 p-2 text-xs">
      <Copy size={14} />
    </button>
  );
}
