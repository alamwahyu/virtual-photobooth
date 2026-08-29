# AWH Virtual Photobooth

Production-ready virtual wedding photobooth built with Next.js, TypeScript, Prisma, PostgreSQL, Tailwind CSS, secure admin sessions, browser camera capture, and local Canvas composition.

The app is designed to run under the subpath:

```txt
https://awhdigital.my.id/virtual-photobooth
```

## Features

- Public event URL per wedding, for example `/virtual-photobooth/event/alam-ghina`
- Layout selection backed by database `configJson`
- Frame selection with background color, optional uploaded background image, transparent overlay, and dynamic event text
- Camera permission only after user clicks `Mulai Foto`
- Front/rear camera switching with mirrored front-camera preview
- Countdown, multi-capture based on `layout.photoCount`, review, retake per pose
- Browser-only Canvas final composition and download/share
- Anonymous photobooth session analytics without saving raw camera photos
- Admin login using hashed password and HTTP-only cookie
- Admin CRUD for events, layouts, frames, event layout/frame assignment, and QR generation
- Filesystem storage abstraction for uploaded images

## Requirements

- Node.js 22 LTS or newer
- PostgreSQL 16+
- HTTPS in production for camera access

## Local Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:dev
npm run prisma:seed
npm run dev
```

Open:

```txt
http://localhost:3010/virtual-photobooth
```

## Environment

```env
DATABASE_URL="postgresql://virtual_photobooth_user:CHANGE_THIS_PASSWORD@localhost:5432/virtual_photobooth"
SESSION_SECRET="CHANGE_THIS_TO_A_32_CHAR_RANDOM_SECRET"
APP_URL="https://awhdigital.my.id/virtual-photobooth"
NEXT_PUBLIC_BASE_PATH="/virtual-photobooth"
UPLOAD_DIR="/var/www/virtual-photobooth/storage"
ADMIN_EMAIL="admin@awhdigital.my.id"
ADMIN_PASSWORD="CHANGE_THIS_ADMIN_PASSWORD"
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are only used by `prisma db seed`; do not commit production secrets.

## Database

```bash
npm run prisma:dev
npm run prisma:seed
```

For production:

```bash
npm run prisma:migrate
npm run prisma:seed
```

## Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

E2E tests require the database seed and use Chromium fake media stream:

```bash
npm run test:e2e
```

## Architecture

- `src/app`: Next.js App Router pages and API route handlers
- `src/components/photobooth`: public booth UI
- `src/hooks/useCamera.ts`: camera lifecycle, flip, capture, and stream cleanup
- `src/hooks/useCountdown.ts`: countdown state
- `src/lib/canvas`: Canvas composition engine
- `src/lib/auth`: session cookie signing, admin guard, login rate limit
- `src/lib/storage`: filesystem storage abstraction
- `prisma/schema.prisma`: PostgreSQL schema
- `prisma/seed.ts`: default admin, event, layouts, frames

## Camera Privacy

Raw captured photos are not uploaded by default. The final image is composed in the guest browser. `PhotoboothSession` stores only event/layout/frame IDs, start/completion timestamps, device type, and user agent.

## Troubleshooting

- Camera fails in production: verify HTTPS and browser camera permission.
- Public assets 404: verify `NEXT_PUBLIC_BASE_PATH=/virtual-photobooth` and Nginx proxy path.
- Admin cannot login: rerun seed with valid `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Upload fails: verify `UPLOAD_DIR` exists and the Node process can write to it.
- Uploaded frame image does not appear: verify Nginx serves `/virtual-photobooth/uploads/` from `UPLOAD_DIR`.
# virtual-photobooth
