import type { EventStatus, Prisma } from "@prisma/client";
import { eventSchema, frameSchema, layoutSchema } from "@/lib/validation/admin";

export async function eventDataFromRequest(request: Request) {
  const parsed = eventSchema.parse(await request.json());
  return {
    scalar: {
      coupleName1: parsed.coupleName1,
      coupleName2: parsed.coupleName2,
      displayName: parsed.displayName,
      slug: parsed.slug,
      eventDate: new Date(parsed.eventDate),
      venueName: parsed.venueName,
      venueAddress: parsed.venueAddress,
      description: parsed.description,
      coverImage: parsed.coverImage,
      logoImage: parsed.logoImage,
      status: parsed.status as EventStatus,
      primaryColor: parsed.primaryColor,
      secondaryColor: parsed.secondaryColor,
      backgroundColor: parsed.backgroundColor,
      textColor: parsed.textColor
    },
    layoutIds: parsed.layoutIds,
    frameIds: parsed.frameIds,
    defaultLayoutId: parsed.defaultLayoutId,
    defaultFrameId: parsed.defaultFrameId
  };
}

export async function layoutDataFromRequest(request: Request) {
  const parsed = layoutSchema.parse(await request.json());
  return {
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description,
    photoCount: parsed.photoCount,
    orientation: parsed.orientation,
    canvasWidth: parsed.canvasWidth,
    canvasHeight: parsed.canvasHeight,
    previewImage: parsed.previewImage,
    configJson: JSON.parse(parsed.configJson) as Prisma.InputJsonValue,
    isActive: parsed.isActive
  };
}

export async function frameDataFromRequest(request: Request) {
  const parsed = frameSchema.parse(await request.json());
  return {
    name: parsed.name,
    slug: parsed.slug,
    layoutId: parsed.layoutId,
    overlayImage: parsed.overlayImage,
    previewImage: parsed.previewImage,
    backgroundColor: parsed.backgroundColor,
    configJson: JSON.parse(parsed.configJson) as Prisma.InputJsonValue,
    isActive: parsed.isActive
  };
}
