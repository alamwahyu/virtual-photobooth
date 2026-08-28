import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { formatEventDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const [totalEvents, publishedEvents, totalFrames, totalLayouts, recent, sessions, completed] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.frame.count(),
    prisma.layout.count(),
    prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.photoboothSession.count(),
    prisma.photoboothSession.count({ where: { completedAt: { not: null } } })
  ]);
  return (
    <AdminShell>
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Dashboard</h1>
        <p className="mt-1 text-black/60">Ringkasan event, layout, frame, dan sesi photobooth.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        {[["Total Events", totalEvents], ["Published", publishedEvents], ["Frames", totalFrames], ["Layouts", totalLayouts], ["Sessions", sessions], ["Completed", completed]].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white p-5 shadow-soft">
            <p className="text-sm text-black/55">{label}</p>
            <p className="mt-2 font-serif text-4xl">{value}</p>
          </div>
        ))}
      </section>
      <section className="rounded-lg bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Recent Events</h2>
          <Link href="/admin/events/new" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">New Event</Link>
        </div>
        <div className="divide-y">
          {recent.map((event) => (
            <Link key={event.id} href={`/admin/events/${event.id}`} className="grid gap-2 py-3 text-sm md:grid-cols-4">
              <strong>{event.displayName}</strong>
              <span>{formatEventDate(event.eventDate)}</span>
              <span>{event.venueName}</span>
              <span>{event.status}</span>
            </Link>
          ))}
          {!recent.length && <p className="py-8 text-sm text-black/60">Belum ada event. Buat event pertamamu.</p>}
        </div>
      </section>
    </div>
    </AdminShell>
  );
}
