"use client";

import { useRouter } from "next/navigation";
import { appPath } from "@/lib/utils/base-path";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Logout"
      title="Logout"
      onClick={async () => {
        await fetch(appPath("/api/admin/logout"), { method: "POST" });
        router.push("/admin/login");
      }}
      className="flex min-h-11 items-center justify-center rounded-md px-3 text-left text-sm font-medium hover:bg-linen"
    >
      {children}
    </button>
  );
}
