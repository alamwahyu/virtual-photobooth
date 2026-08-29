import { prisma } from "@/lib/db/prisma";
import type { PublicEvent } from "@/types";

export async function getPublishedEvent(slug: string): Promise<PublicEvent | null> {
  const event = await prisma.event.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      layouts: { include: { layout: true }, orderBy: { sortOrder: "asc" } },
      frames: { include: { frame: true }, orderBy: { sortOrder: "asc" } }
    }
  });

  if (!event) return null;

  return {
    id: event.id,
    coupleName1: event.coupleName1,
    coupleName2: event.coupleName2,
    displayName: event.displayName,
    theme: event.theme,
    slug: event.slug,
    eventDate: event.eventDate.toISOString(),
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    description: event.description,
    coverImage: event.coverImage,
    logoImage: event.logoImage,
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
    backgroundColor: event.backgroundColor,
    textColor: event.textColor,
    layouts: event.layouts
      .filter((item) => item.layout.isActive)
      .map((item) => ({
        id: item.layout.id,
        name: item.layout.name,
        slug: item.layout.slug,
        description: item.layout.description,
        photoCount: item.layout.photoCount,
        orientation: item.layout.orientation,
        canvasWidth: item.layout.canvasWidth,
        canvasHeight: item.layout.canvasHeight,
        previewImage: item.layout.previewImage,
        configJson: item.layout.configJson as never,
        isDefault: item.isDefault
      })),
    frames: event.frames
      .filter((item) => item.frame.isActive)
      .map((item) => ({
        id: item.frame.id,
        name: item.frame.name,
        slug: item.frame.slug,
        layoutId: item.frame.layoutId,
        overlayImage: item.frame.overlayImage,
        previewImage: item.frame.previewImage,
        backgroundColor: item.frame.backgroundColor,
        backgroundImage: item.frame.backgroundImage,
        configJson: item.frame.configJson as never,
        isDefault: item.isDefault
      }))
  };
}
