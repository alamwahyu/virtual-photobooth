# Deployment Guide: Ubuntu Server 24.04 LTS

Target URL:

```txt
https://awhdigital.my.id/virtual-photobooth
```

Node listens on `127.0.0.1:3010`. Nginx serves HTTPS and proxies the `/virtual-photobooth/` subpath.

## 1. Install Node.js

Use Node.js 22 LTS or newer.

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

## 2. Install PostgreSQL

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

## 3. Create Database

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE virtual_photobooth;
CREATE USER virtual_photobooth_user WITH ENCRYPTED PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE virtual_photobooth TO virtual_photobooth_user;
\c virtual_photobooth
GRANT ALL ON SCHEMA public TO virtual_photobooth_user;
\q
```

Use a strong production password.

## 4. Deploy Source

```bash
sudo mkdir -p /var/www/virtual-photobooth
sudo chown -R $USER:www-data /var/www/virtual-photobooth
git clone <YOUR_REPOSITORY_URL> /var/www/virtual-photobooth/app
cd /var/www/virtual-photobooth/app
npm ci
```

## 5. Configure Environment

```bash
cp .env.example .env
nano .env
```

Required values:

```env
DATABASE_URL="postgresql://virtual_photobooth_user:CHANGE_THIS_PASSWORD@localhost:5432/virtual_photobooth"
SESSION_SECRET="GENERATE_A_RANDOM_32_PLUS_CHARACTER_SECRET"
APP_URL="https://awhdigital.my.id/virtual-photobooth"
NEXT_PUBLIC_BASE_PATH="/virtual-photobooth"
UPLOAD_DIR="/var/www/virtual-photobooth/storage"
ADMIN_EMAIL="admin@awhdigital.my.id"
ADMIN_PASSWORD="SET_INITIAL_ADMIN_PASSWORD"
NODE_ENV="production"
```

## 6. Storage Permissions

```bash
sudo mkdir -p /var/www/virtual-photobooth/storage/{events,frames,layouts,uploads}
sudo chown -R $USER:www-data /var/www/virtual-photobooth/storage
sudo chmod -R 775 /var/www/virtual-photobooth/storage
```

## 7. Prisma Migration And Seed

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

After seeding, remove `ADMIN_PASSWORD` from process environments that do not need it.

## 8. Build

```bash
npm run build
```

## 9. PM2

```bash
sudo npm install -g pm2
pm2 start npm --name awh-virtual-photobooth -- start
pm2 save
pm2 startup systemd
```

## 10. systemd Alternative

Create `/etc/systemd/system/awh-virtual-photobooth.service`:

```ini
[Unit]
Description=AWH Virtual Photobooth
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=/var/www/virtual-photobooth/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now awh-virtual-photobooth
sudo systemctl status awh-virtual-photobooth
```

## 11. Nginx

This config keeps `/virtual-photobooth` intact for routes, API, Next static assets, uploads, and redirects.

```nginx
server {
    listen 443 ssl http2;
    server_name awhdigital.my.id;

    # SSL configuration is assumed to already exist.

    location = /virtual-photobooth {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /virtual-photobooth/uploads/ {
        alias /var/www/virtual-photobooth/storage/;
        access_log off;
        expires 30d;
    }

    location /virtual-photobooth/ {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
```

Do not use a trailing slash in `proxy_pass`; with Next.js `basePath=/virtual-photobooth`, the upstream must receive the full subpath.

Reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 12. Verify

```bash
curl -I https://awhdigital.my.id/virtual-photobooth/
curl -I https://awhdigital.my.id/virtual-photobooth/admin/login
curl -I https://awhdigital.my.id/virtual-photobooth/event/alam-ghina
```

Browser checks:

- Admin login works.
- Event create/edit persists to PostgreSQL.
- Public event opens only when status is `PUBLISHED`.
- Camera permission is requested only after `Mulai Foto`.
- Final photo downloads.
- Network tab shows no accidental redirects to `/`.
