# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rentplatform is a rental marketplace: a FastAPI backend (`backend/`) and a Next.js/MUI dashboard frontend (`frontend/`, based on the Devias "Material Kit React" template). Domain: shops, product listings, bookings, staff/leave, categories, payments.

## Commands

### Backend (`backend/`)

```bash
source venv/bin/activate
uvicorn app.main:app --reload        # run dev server (http://127.0.0.1:8000)
alembic revision --autogenerate -m "message"   # create a migration after model changes
alembic upgrade head                 # apply migrations
```

There is no `requirements.txt` committed — installed packages (from `venv`) include `fastapi`, `uvicorn`, `sqlalchemy`, `alembic`, `psycopg2-binary`, `pydantic`, `pydantic-settings`, `python-jose`, `passlib`. No test suite currently exists in `backend/`.

Requires a `backend/.env` with `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` (see `app/config.py` for the exact `Settings` fields — it will fail to boot if any are missing).

### Frontend (`frontend/`)

```bash
npm run dev         # dev server (http://localhost:3000)
npm run build
npm run lint         # npm run lint:fix to auto-fix
npm run typecheck    # tsc --noEmit
npm run format:check # npm run format:write to auto-fix
```

No test runner script is wired up in `package.json` despite `jest` being a dependency. Requires `frontend/.env.local` with `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://127.0.0.1:8000` if unset).

## Architecture

### Backend: strict layering

Every domain (bookings, products, shops, users, categories, staff_leave, payments, reviews, wishlist, notifications) follows the same four-layer flow, and new features should match it:

```
routers/<name>.py  →  services/<name>_service.py  →  repositories/<name>_repository.py  →  models/<name>.py
```

- **Routers** (`app/routers/`): FastAPI `APIRouter`s. Only handle request/response wiring — `Depends(get_db)`, `Depends(get_current_user)` — and delegate immediately to the matching Service. No business logic here.
- **Services** (`app/services/`): all business logic and authorization checks, as classes of `@staticmethod`s (e.g. `BookingService`). This is where role/ownership checks live (see `_ensure_booking_access` in `booking_service.py` for the pattern: super-admins bypass, everyone else is scoped to `current_user.shop_id`).
- **Repositories** (`app/repositories/`): all DB access, also `@staticmethod` classes wrapping plain SQLAlchemy `Session` queries (`db.query(...)`, `db.add`/`commit`/`refresh`). No SQLAlchemy should be imported into services or routers directly.
- **Models** (`app/models/`): SQLAlchemy 2.0 declarative models using typed `Mapped[...]` columns, UUID primary keys (`uuid.uuid4`), and the shared `TimestampMixin` (`app/models/base.py`) for `created_at`/`updated_at`.
- **Schemas** (`app/schemas/`): Pydantic request/response models, kept separate from the SQLAlchemy models.

Auth: `app/dependencies.py` decodes the bearer JWT and loads the `User` via `UserRepository`; `app/core/auth.py` handles password hashing (bcrypt via passlib) and access/refresh token creation. Roles and status enums live centrally in `app/core/enums.py` (`UserRole`, `BookingStatus`, `LeaveStatus`) — reuse these rather than adding ad hoc string statuses.

`app/middleware/authentication.py` and `app/middleware/exception_handler.py` currently exist but are empty/unused; `LoggingMiddleware` (`app/middleware/logging.py`) is also not yet registered in `main.py` — don't assume any of these are active without checking `main.py`.

Static file uploads are mounted at `/uploads` from `UPLOAD_ROOT` (`app/utils/upload.py`). CORS in `main.py` currently allows any `localhost`/`127.0.0.1` origin.

### Frontend: Next.js App Router + MUI

- Routes live under `src/app/` (auth: sign-in/sign-up/reset-password; dashboard: overview/account/bookings/categories/customers/products/shops/settings/integrations). Central route strings are defined once in `src/paths.ts` — reference `paths.*` rather than hardcoding route strings.
- `src/lib/api.ts` is the single HTTP client: it attaches the bearer token from browser storage, auto-refreshes on a 401 via `/users/refresh-token` and retries once, and unwraps the backend's `{ success, message, data }` envelope automatically. Use the exported `api.get/post/put/delete` helpers for all backend calls rather than calling `fetch` directly.
- Auth token storage/keys (`ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`) and `API_BASE_URL` are also defined in `src/lib/api.ts`.
- `src/contexts/user-context.tsx` + `src/hooks/use-user.ts` expose the current user throughout the dashboard.
- Theming lives in `src/styles/theme`; global styles in `src/styles/global.css`.
