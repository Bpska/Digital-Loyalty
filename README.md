# Digital Loyalty Voucher SaaS

## Project Structure
```
/
├── frontend/   # Next.js App Router + TypeScript + Shadcn UI
└── backend/    # Express.js + TypeScript + Prisma + PostgreSQL
```

## Quick Start (Development)

### Prerequisites
- Node.js >= 20
- PostgreSQL >= 15
- Docker (optional, recommended)

### With Docker Compose (Recommended)
```bash
cp .env.example .env
# Edit .env with your values
docker-compose up -d
```

### Without Docker
```bash
# Backend
cd backend
cp ../.env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

## URLs
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api/v1 |
| Swagger Docs | http://localhost:4000/api/docs |

## Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Zustand
- **Backend:** Express.js, TypeScript, Prisma, PostgreSQL
- **Auth:** JWT (access + refresh tokens, httpOnly cookies)
- **Payments:** Razorpay
- **SMS OTP:** MSG91 / Twilio (configurable)
- **DevOps:** Docker, Nginx, Hostinger VPS

## Panels
| Panel | Route | Audience |
|---|---|---|
| Super Admin | `/super-admin/*` | Platform owner |
| Business Admin | `/business/*` | Business owners |
| Staff | `/staff/*` | Counter staff (PWA) |
| Customer | `/customer/*` | End users (PWA) |

## Deployment (Hostinger VPS)
See [deployment guide](./docs/deployment.md) for full Nginx + Certbot SSL setup.
