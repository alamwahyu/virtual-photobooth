import { notFound } from "next/navigation";
import { getPublishedEvent } from "@/lib/db/public-event";
import { PhotoboothApp } from "@/components/photobooth/PhotoboothApp";

export const dynamic = "force-dynamic";

export default async function BoothPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublishedEvent(slug);
  if (!event) notFound();
  return <PhotoboothApp event={event} />;
}
