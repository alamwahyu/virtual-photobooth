"use client";

export function Countdown({ value }: { value: number | null }) {
  if (value === null) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/25">
      <div className="animate-ping-once rounded-full bg-white/95 px-10 py-6 font-serif text-7xl text-ink shadow-soft">{value}</div>
    </div>
  );
}
