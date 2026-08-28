import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatEventDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { eventDate: "asc" },
    take: 12
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-10">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Virtual Photobooth</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight md:text-7xl">AWH Virtual Photobooth</h1>
        <p className="mt-5 max-w-2xl text-lg text-black/65">Berpose sebentar. Bawa pulang ceritanya dari perayaan yang sedang berlangsung.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {events.map((event) => (
          <Link key={event.id} href={`/event/${event.slug}`} className="rounded-lg border border-black/10 bg-white p-5 shadow-soft transition hover:-translate-y-0.5">
            <p className="text-sm uppercase tracking-[0.2em] text-gold">Photobooth</p>
            <h2 className="mt-4 font-serif text-4xl">{event.displayName}</h2>
            <p className="mt-3 text-sm text-black/60">{formatEventDate(event.eventDate)}</p>
            <p className="mt-1 text-sm text-black/60">{event.venueName}</p>
          </Link>
        ))}
        {!events.length && <p className="rounded-lg bg-white p-5">Belum ada event yang dipublikasikan.</p>}
      </section>
    </main>
  );
}
