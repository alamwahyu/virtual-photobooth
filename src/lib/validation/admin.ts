import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const eventSchema = z.object({
  coupleName1: z.string().min(1),
  coupleName2: z.string().min(1),
  displayName: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  eventDate: z.string().min(1),
  venueName: z.string().min(1),
  venueAddress: z.string().optional().default(""),
  description: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  logoImage: z.string().optional().default(""),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  primaryColor: z.string().default("#b58b4b"),
  secondaryColor: z.string().default("#d9a6a0"),
  backgroundColor: z.string().default("#fbf7f0"),
  textColor: z.string().default("#221f1c"),
  layoutIds: z.array(z.string()).default([]),
  frameIds: z.array(z.string()).default([]),
  defaultLayoutId: z.string().optional().nullable(),
  defaultFrameId: z.string().optional().nullable()
});

export const layoutSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional().default(""),
  photoCount: z.coerce.number().int().min(1).max(12),
  orientation: z.string().min(1),
  canvasWidth: z.coerce.number().int().min(600),
  canvasHeight: z.coerce.number().int().min(600),
  previewImage: z.string().optional().default(""),
  configJson: z.string().min(2),
  isActive: z.boolean().default(true)
});

export const frameSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  layoutId: z.string().min(1),
  overlayImage: z.string().optional().default(""),
  previewImage: z.string().optional().default(""),
  backgroundColor: z.string().default("#ffffff"),
  configJson: z.string().min(2),
  isActive: z.boolean().default(true)
});
