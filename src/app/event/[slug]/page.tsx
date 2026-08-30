import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { getPublishedEvent } from "@/lib/db/public-event";
import { assetPath } from "@/lib/utils/base-path";
import { formatEventDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublishedEvent(slug);
  if (!event) notFound();

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: event.backgroundColor, color: event.textColor }}>
      <section className="mx-auto grid min-h-screen max-w-6xl content-center gap-7 px-4 py-6 sm:px-5 sm:py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-10">
        <div className="order-2 min-w-0 md:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm sm:tracking-[0.28em]" style={{ color: event.primaryColor }}>
            AWH Virtual Photobooth
          </p>
          {event.theme && <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] sm:mt-6 sm:text-lg sm:tracking-[0.22em]" style={{ color: event.primaryColor }}>{event.theme}</p>}
          <h1 className="mt-3 break-words font-serif text-5xl leading-none sm:text-6xl md:text-8xl">{event.displayName}</h1>
          <p className="mt-4 text-xl sm:mt-5 sm:text-2xl">Berpose sebentar. Bawa pulang ceritanya.</p>
          <p className="mt-3 max-w-xl text-base leading-relaxed opacity-70 sm:mt-4 sm:text-lg">{event.description || "Pilih format favoritmu, ambil beberapa pose, lalu bawa pulang kenangan dari perayaan ini."}</p>
          <div className="mt-6 grid gap-3 text-sm sm:mt-8 sm:text-base">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 shrink-0" size={21} />
              <span className="min-w-0">{formatEventDate(event.eventDate)}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 shrink-0" size={21} />
              <span className="min-w-0 break-words">{event.venueName}</span>
            </div>
          </div>
          <Link href={`/event/${event.slug}/booth`} className="mt-7 inline-flex touch-target w-full items-center justify-center rounded-md bg-ink px-6 py-3 font-semibold text-white shadow-soft sm:mt-9 sm:w-auto">
            Masuk AWH Virtual Photobooth
          </Link>
        </div>
        <div className="order-1 mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-black/10 bg-white/60 shadow-soft md:order-2 md:max-w-none">
          {event.coverImage ? (
            <div className="relative aspect-[4/5] sm:aspect-[3/4]">
              <img src={assetPath(event.coverImage)} alt={event.displayName} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                {event.logoImage && <img src={assetPath(event.logoImage)} alt="" className="mb-3 h-12 w-12 rounded-full border border-white/40 object-cover sm:mb-4 sm:h-14 sm:w-14" />}
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-xs sm:tracking-[0.2em]">{event.theme || "The Wedding of"}</p>
                <div className="mt-1 break-words font-serif text-3xl leading-tight sm:text-4xl">{event.displayName}</div>
              </div>
            </div>
          ) : (
            <div className="aspect-[4/5] p-4 sm:aspect-[3/4] sm:p-5">
              <div className="flex h-full flex-col justify-between rounded-md border border-dashed border-gold/50 bg-white p-5 sm:p-6">
                <div className="grid flex-1 gap-3">
                  <div className="rounded bg-linen" />
                  <div className="rounded bg-linen" />
                  <div className="rounded bg-linen" />
                </div>
                <div className="break-words pt-6 text-center font-serif text-2xl sm:text-3xl">{event.displayName}</div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
