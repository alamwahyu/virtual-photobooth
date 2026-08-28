import { clsx } from "clsx";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx("min-h-11 w-full rounded-md border border-black/15 bg-white px-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx("min-h-28 w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20", props.className)} />;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="space-y-1 text-sm font-medium">{children}</label>;
}
