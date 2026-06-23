# Digital Loyalty Voucher SaaS — Hostinger VPS Deployment Guide

This document outlines the step-by-step production setup and deployment procedures for hosting the multi-tenant SaaS application on a Hostinger VPS.

---

## 1. Domain DNS Configuration

Point your domains and subdomains to your VPS IP address by creating **A Records** in your domain registrar's DNS control panel:

| Type | Host / Name | Value (Target) | Description |
|---|---|---|---|
| A | `frunko.in` | `your_vps_ip` | Frontend PWA Web Interface |
| A | `api.frunko.in` | `your_vps_ip` | Backend REST API Service |

---

## 2. Server Provisioning & Setup

SSH into your Hostinger Ubuntu VPS and install the core Docker runtime prerequisites:

### SSH Login
```bash
ssh root@your_vps_ip
```

### Install Docker Engine & Compose
```bash
# Update package directory
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install packages
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 3. Cloning Project & Configuring Environment Variables

### Clone codebase
Clone the project repository into `/var/www/dlv-saas`:
```bash
mkdir -p /var/www
git clone <repository_url> /var/www/dlv-saas
cd /var/www/dlv-saas
```

### Configure environment
Copy `.env.example` to both the root directory (for Docker Compose variables) and the `backend` directory (for application configuration):
```bash
# Root env (for docker-compose passwords, VITE_API_URL, etc.)
cp .env.example .env
nano .env

# Backend env (for Express backend app configurations)
cp .env.example backend/.env
nano backend/.env
```

Make sure to change the following values in production:
- **Root `.env`**:
  - `POSTGRES_PASSWORD` — set a custom secure password (this is used by the database container and the backend connection string).
- **Backend `backend/.env`**:
  - `DATABASE_URL` — update the password in the connection string to match your custom secure password.
  - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET` — generate 32+ character random strings.
  - `QR_HMAC_SECRET` — secure rotatable signing token.
  - `FRONTEND_URL` & `BACKEND_URL` — configure to your domains (`https://frunko.in` and `https://api.frunko.in`).
  - `OTP_PROVIDER` — switch to `msg91` or `twilio` and input keys.
  - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` — add production keys.
  - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` — configure Google Auth details.

---

## 4. Build and Run Container Orchestration

Run the orchestration containers in daemon mode using Docker Compose:

```bash
# Build and run containers
docker compose -f docker-compose.yml up -d --build
```

### Run Database Migrations & Seeding
Once the containers are healthy, migrate your schema and seed initial plans and the Super Admin user:
```bash
# Apply database migrations
docker compose exec backend npx prisma migrate deploy

# Run seed scripts
docker compose exec backend npm run prisma:seed
```

### Generate VAPID Keys for Web Push Notifications
Web Push Notifications require VAPID key pairs. Run the VAPID generator script inside the backend container to generate secure credentials:
```bash
# Run VAPID key generator script
docker compose exec backend node scripts/generate-vapid.js
```
The script will output your VAPID keys to the terminal. To ensure they persist on container restarts and host rebuilds:
1. **Copy** the generated `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` values from the terminal output.
2. **Open** `backend/.env` on the host machine (`nano backend/.env`).
3. **Paste** the generated variables at the bottom of the file:
   ```env
   VAPID_PUBLIC_KEY="your_generated_public_key"
   VAPID_PRIVATE_KEY="your_generated_private_key"
   VAPID_SUBJECT="mailto:your-admin-email@domain.com"
   ```
4. **Restart** the backend container to apply the changes:
   ```bash
   docker compose restart backend
   ```

---

## 5. Nginx Reverse Proxy & SSL Setup

Install Nginx and Certbot on the host system to terminate SSL and route requests to our standalone Dockerized apps.

### Install Nginx and Certbot
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### Configure Nginx Server Blocks
Create Nginx configuration files:
```bash
sudo nano /etc/nginx/sites-available/dlv-saas
```

Paste the following configurations:
```nginx
# ==========================================================
# Digital Loyalty Voucher SaaS — Nginx Server Config
# ==========================================================

# ─── FRONTEND (Vite PWA) ──────────────────────────────────
server {
    server_name frunko.in;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static uploads redirect (served by nginx volume or api)
    location /uploads/ {
        proxy_pass http://localhost:6003/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

# ─── BACKEND API (Express) ──────────────────────────────
server {
    server_name api.frunko.in;

    location / {
        proxy_pass http://localhost:6003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/dlv-saas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Secure with Let's Encrypt SSL
Use Certbot to automatically issue and configure SSL certificates:
```bash
sudo certbot --nginx -d frunko.in -d api.frunko.in
```

Select option `2` to redirect all HTTP traffic to HTTPS. Certbot will automatically install cron renew jobs.

---

## 6. Verification and Health Monitoring

Verify that your installation is online and running correctly:

- App Health Check: `https://api.frunko.in/health` (should return status: "ok")
- App API Docs: `https://api.frunko.in/api/docs` (interactive Swagger UI)
- Frontend Home: `https://frunko.in/login` (login interface)

### Logs Auditing
To inspect container log outputs, run:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```
