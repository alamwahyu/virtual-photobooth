import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { getPublishedEvent } from "@/lib/db/public-event";
import { formatEventDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublishedEvent(slug);
  if (!event) notFound();

  return (
    <main className="min-h-screen" style={{ backgroundColor: event.backgroundColor, color: event.textColor }}>
      <section className="mx-auto grid min-h-screen max-w-6xl content-center gap-10 px-5 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: event.primaryColor }}>
            Virtual Photobooth
          </p>
          {event.theme && <p className="mt-6 text-lg font-semibold uppercase tracking-[0.22em]" style={{ color: event.primaryColor }}>{event.theme}</p>}
          <h1 className="mt-3 font-serif text-6xl leading-none md:text-8xl">{event.displayName}</h1>
          <p className="mt-5 text-2xl">Berpose sebentar. Bawa pulang ceritanya.</p>
          <p className="mt-4 max-w-xl text-lg opacity-70">{event.description || "Pilih format favoritmu, ambil beberapa pose, lalu bawa pulang kenangan dari perayaan ini."}</p>
          <div className="mt-8 grid gap-3 text-base">
            <div className="flex items-center gap-3">
              <CalendarDays size={21} />
              <span>{formatEventDate(event.eventDate)}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={21} />
              <span>{event.venueName}</span>
            </div>
          </div>
          <Link href={`/event/${event.slug}/booth`} className="mt-9 inline-flex touch-target items-center rounded-md bg-ink px-6 py-3 font-semibold text-white shadow-soft">
            Masuk Photobooth
          </Link>
        </div>
        <div className="rounded-lg border border-black/10 bg-white/60 p-5 shadow-soft">
          <div className="aspect-[3/4] rounded-md border border-dashed border-gold/50 bg-white p-6">
            <div className="flex h-full flex-col justify-between">
              <div className="grid flex-1 gap-3">
                <div className="rounded bg-linen" />
                <div className="rounded bg-linen" />
                <div className="rounded bg-linen" />
              </div>
              <div className="pt-6 text-center font-serif text-3xl">{event.displayName}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
