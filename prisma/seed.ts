import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const photostripConfig = {
  slots: [
    { x: 70, y: 70, width: 1060, height: 650 },
    { x: 70, y: 770, width: 1060, height: 650 },
    { x: 70, y: 1470, width: 1060, height: 650 }
  ]
};

const gridConfig = {
  slots: [
    { x: 70, y: 70, width: 515, height: 600 },
    { x: 615, y: 70, width: 515, height: 600 },
    { x: 70, y: 700, width: 515, height: 600 },
    { x: 615, y: 700, width: 515, height: 600 }
  ]
};

const portraitConfig = {
  slots: [{ x: 80, y: 80, width: 1040, height: 1320 }]
};

const frameTextConfig = {
  mirrorOutput: true,
  texts: [
    { type: "coupleName", x: 600, y: 2240, font: "serif", fontSize: 74, color: "#221f1c", align: "center" },
    { type: "eventDate", x: 600, y: 2325, font: "sans-serif", fontSize: 34, color: "#6f665d", align: "center" },
    { type: "venue", x: 600, y: 2380, font: "sans-serif", fontSize: 28, color: "#6f665d", align: "center" }
  ],
  decorations: [{ type: "line", x1: 360, y1: 2185, x2: 840, y2: 2185, color: "#b58b4b", width: 3 }]
};

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running prisma db seed.");
  }

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "AWH Admin",
      passwordHash: await bcrypt.hash(password, 12)
    }
  });

  const photostrip = await prisma.layout.upsert({
    where: { slug: "photostrip-3" },
    update: {},
    create: {
      name: "Photostrip",
      slug: "photostrip-3",
      description: "Vertical strip dengan tiga pose dan area teks wedding.",
      photoCount: 3,
      orientation: "portrait",
      canvasWidth: 1200,
      canvasHeight: 2500,
      configJson: photostripConfig
    }
  });

  const grid = await prisma.layout.upsert({
    where: { slug: "grid-2x2" },
    update: {},
    create: {
      name: "Grid 2x2",
      slug: "grid-2x2",
      description: "Empat pose dalam grid seimbang.",
      photoCount: 4,
      orientation: "square",
      canvasWidth: 1200,
      canvasHeight: 1600,
      configJson: gridConfig
    }
  });

  const portrait = await prisma.layout.upsert({
    where: { slug: "portrait" },
    update: {},
    create: {
      name: "Portrait",
      slug: "portrait",
      description: "Satu pose portrait dengan teks pasangan.",
      photoCount: 1,
      orientation: "portrait",
      canvasWidth: 1200,
      canvasHeight: 1800,
      configJson: portraitConfig
    }
  });

  const frames = await Promise.all([
    prisma.frame.upsert({
      where: { slug: "minimal-white" },
      update: {},
      create: { name: "Minimal White", slug: "minimal-white", layoutId: photostrip.id, backgroundColor: "#ffffff", configJson: frameTextConfig }
    }),
    prisma.frame.upsert({
      where: { slug: "elegant-wedding" },
      update: {},
      create: { name: "Elegant Wedding", slug: "elegant-wedding", layoutId: grid.id, backgroundColor: "#fbf7f0", configJson: frameTextConfig }
    }),
    prisma.frame.upsert({
      where: { slug: "classic-black" },
      update: {},
      create: { name: "Classic Black", slug: "classic-black", layoutId: portrait.id, backgroundColor: "#151515", configJson: { ...frameTextConfig, texts: [{ type: "coupleName", x: 600, y: 1540, font: "serif", fontSize: 72, color: "#ffffff", align: "center" }, { type: "eventDate", x: 600, y: 1615, font: "sans-serif", fontSize: 32, color: "#e8dccb", align: "center" }] } }
    })
  ]);

  const event = await prisma.event.upsert({
    where: { slug: "alam-ghina" },
    update: {},
    create: {
      coupleName1: "Alam",
      coupleName2: "Ghina",
      displayName: "Alam & Ghina",
      slug: "alam-ghina",
      eventDate: new Date("2026-09-30T10:00:00.000Z"),
      venueName: "Edelweiss Wedding Hall",
      venueAddress: "Jakarta",
      description: "Pilih format favoritmu, ambil beberapa pose, lalu bawa pulang kenangan dari perayaan ini.",
      status: "PUBLISHED"
    }
  });

  for (const [index, layout] of [photostrip, grid, portrait].entries()) {
    await prisma.eventLayout.upsert({
      where: { eventId_layoutId: { eventId: event.id, layoutId: layout.id } },
      update: { sortOrder: index, isDefault: index === 0 },
      create: { eventId: event.id, layoutId: layout.id, sortOrder: index, isDefault: index === 0 }
    });
  }

  for (const [index, frame] of frames.entries()) {
    await prisma.eventFrame.upsert({
      where: { eventId_frameId: { eventId: event.id, frameId: frame.id } },
      update: { sortOrder: index, isDefault: index === 0 },
      create: { eventId: event.id, frameId: frame.id, sortOrder: index, isDefault: index === 0 }
    });
  }

  await prisma.systemSetting.create({ data: {} }).catch(() => undefined);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
