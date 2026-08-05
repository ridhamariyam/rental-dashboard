# Rentplatform

A rental marketplace platform with a FastAPI backend and a Next.js (Material Kit) dashboard frontend. Supports shops, product listings, bookings, staff/leave management, categories, and payments.

## Tech Stack

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy 2.0 + Alembic (migrations)
- PostgreSQL (via psycopg2)
- Pydantic v2 / pydantic-settings
- python-jose + passlib (auth, JWT, password hashing)

**Frontend**
- Next.js 15 + React 19 (TypeScript)
- MUI (Material UI) v7
- React Hook Form + Zod
- ApexCharts

## Project Structure

```
Rentplatform/
├── backend/
│   ├── app/
│   │   ├── routers/       # API endpoints (auth, users, bookings, shop, products, categories, ...)
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── core/          # Auth, security, enums
│   │   ├── middleware/    # Logging, exception handling, authentication
│   │   ├── utils/         # Uploads, email, SMS, pagination, helpers
│   │   ├── config.py      # Settings (env-based)
│   │   ├── database.py    # DB session/engine
│   │   └── main.py        # FastAPI app entrypoint
│   ├── alembic/           # DB migrations
│   └── uploads/           # Uploaded files (served at /uploads)
└── frontend/
    └── src/
        ├── app/           # Next.js App Router pages (auth, dashboard, errors)
        ├── components/    # UI components (core, auth, dashboard)
        ├── contexts/      # React contexts (e.g. user context)
        ├── hooks/         # Custom hooks
        ├── lib/           # API client, auth, logging, storage helpers
        └── styles/        # Theming and global styles
```

## Prerequisites

- Python 3.10+
- Node.js 18+ (with npm or pnpm)
- PostgreSQL

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt   # or install: fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic-settings python-jose passlib
```

Create a `backend/.env` file:

```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/rental_db
SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run migrations and start the server:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`, with static uploads served at `/uploads`.

## Frontend Setup

```bash
cd frontend
npm install
```

Create a `frontend/.env.local` file with the backend API URL (see `src/config.ts` / `src/lib/api.ts` for the expected variable).

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Frontend Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` / `lint:fix` | Lint / auto-fix |
| `npm run typecheck` | TypeScript type checking |
| `npm run format:write` / `format:check` | Prettier formatting |

## CORS

The backend allows requests from `http://localhost:3000` and `http://127.0.0.1:3000` (and any `localhost`/`127.0.0.1` port) by default — update `backend/app/main.py` for other origins.
