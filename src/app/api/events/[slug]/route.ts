import { NextResponse } from "next/server";
import { getPublishedEvent } from "@/lib/db/public-event";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublishedEvent(slug);
  if (!event) return NextResponse.json({ error: "Event tidak ditemukan atau belum dipublikasikan." }, { status: 404 });
  return NextResponse.json(event);
}
