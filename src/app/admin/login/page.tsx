import { getCurrentAdmin } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Admin</p>
        <h1 className="mt-3 font-serif text-4xl">AWH Virtual Photobooth</h1>
        <LoginForm />
      </section>
    </main>
  );
}
