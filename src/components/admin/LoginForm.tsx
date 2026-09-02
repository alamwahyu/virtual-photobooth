"use client";

import { useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { appPath } from "@/lib/utils/base-path";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        const form = new FormData(event.currentTarget);
        const response = await fetch(appPath("/api/admin/login"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
        });
        setLoading(false);
        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: "Login gagal." }));
          setError(data.error);
          return;
        }
        router.push("/admin");
        router.refresh();
      }}
    >
      <Label>Email<Input name="email" type="email" required autoComplete="email" /></Label>
      <Label>Password<Input name="password" type="password" required autoComplete="current-password" /></Label>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button disabled={loading} className="w-full justify-center" aria-label={loading ? "Memproses login" : "Login"} title={loading ? "Memproses login" : "Login"}>
        {loading ? <LoaderCircle className="animate-spin" size={18} /> : <LogIn size={18} />}
      </Button>
    </form>
  );
}
