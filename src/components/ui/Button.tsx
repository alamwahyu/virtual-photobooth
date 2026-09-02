import { clsx } from "clsx";

export function Button({ className, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return (
    <button
      {...props}
      className={clsx(
        "touch-target inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-ink text-white hover:bg-black",
        variant === "secondary" && "border border-black/15 bg-white hover:bg-linen",
        variant === "danger" && "bg-red-700 text-white hover:bg-red-800",
        className
      )}
    />
  );
}
