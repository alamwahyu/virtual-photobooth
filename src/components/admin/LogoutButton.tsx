"use client";

import { useRouter } from "next/navigation";
import { appPath } from "@/lib/utils/base-path";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch(appPath("/api/admin/logout"), { method: "POST" });
        router.push("/admin/login");
      }}
      className="flex min-h-11 items-center gap-3 rounded-md px-3 text-left text-sm font-medium hover:bg-linen"
    >
      {children}
    </button>
  );
}
