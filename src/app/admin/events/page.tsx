import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { CopyUrlButton } from "@/components/admin/CopyUrlButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { publicEventUrl } from "@/lib/utils/base-path";
import { formatEventDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  await requireAdmin();
  const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <AdminShell>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl">Events</h1>
          <p className="text-black/60">Kelola pasangan, tanggal, lokasi, tema, layout, dan frame.</p>
        </div>
        <Link href="/admin/events/new" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">Create Event</Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-soft">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-linen text-black/60">
            <tr><th className="p-3">Event</th><th>Date</th><th>Venue</th><th>Status</th><th>Public URL</th><th>Action</th></tr>
          </thead>
          <tbody className="divide-y">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="p-3 font-medium">{event.displayName}</td>
                <td>{formatEventDate(event.eventDate)}</td>
                <td>{event.venueName}</td>
                <td>{event.status}</td>
                <td><CopyUrlButton url={publicEventUrl(event.slug)} /></td>
                <td className="space-x-2">
                  <Link href={`/admin/events/${event.id}`} className="text-gold">Edit</Link>
                  <Link href={`/event/${event.slug}`} className="text-gold">Preview</Link>
                  <DeleteButton endpoint={`/api/admin/events/${event.id}`} label="Delete" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!events.length && <p className="p-6 text-sm text-black/60">Belum ada event. Buat event pertamamu.</p>}
      </div>
    </div>
    </AdminShell>
  );
}
