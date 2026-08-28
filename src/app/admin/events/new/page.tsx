import { AdminShell } from "@/components/admin/AdminShell";
import { EventForm } from "@/components/admin/EventForm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireAdmin();
  const [layouts, frames] = await Promise.all([prisma.layout.findMany({ where: { isActive: true } }), prisma.frame.findMany({ where: { isActive: true } })]);
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-serif text-4xl">Create Event</h1>
        <p className="text-black/60">Buat URL photobooth publik untuk pasangan.</p>
      </div>
      <EventForm layouts={layouts} frames={frames} />
    </AdminShell>
  );
}
