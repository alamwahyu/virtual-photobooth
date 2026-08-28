import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const session = await prisma.photoboothSession.create({
    data: {
      eventId: id,
      layoutId: typeof body.layoutId === "string" ? body.layoutId : null,
      frameId: typeof body.frameId === "string" ? body.frameId : null,
      deviceType: typeof body.deviceType === "string" ? body.deviceType : "unknown",
      userAgent: request.headers.get("user-agent") || ""
    }
  });
  return NextResponse.json({ id: session.id });
}
