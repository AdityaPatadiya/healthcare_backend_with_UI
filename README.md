# Healthcare (Backend + Frontend)

Comprehensive README for the Healthcare Management project (Django REST Framework backend + React frontend). This repository contains a full-stack healthcare management application with authentication (JWT), patients, doctors and patient-doctor mappings. It is containerized using Docker and orchestrated with docker-compose for easy local development and testing.

## Contents

- `healthcare_backend/` — Django backend (API, models, serializers, views)
- `healthcare-frontend/` — React frontend (SPA that consumes the backend API)
- `docker-compose.yml` — Compose file to run backend, frontend and Postgres locally

## Quick overview

- Backend: Django (Django REST Framework), Simple JWT authentication, PostgreSQL
- Frontend: React (Create React App)
- DB: PostgreSQL (container)
- Dev: Docker + docker-compose for one-command start

## Project structure (top-level)

```
docker-compose.yml
README.md
healthcare_backend/
  Dockerfile
  manage.py
  requirements.txt
  api/
    models.py
    serializers.py
    views.py
    urls.py
  healthcare_backend/
    settings.py
    urls.py
healthcare-frontend/
  package.json
  src/
    App.js
    components/
```

## Prerequisites

- Docker & Docker Compose installed (recommended)
- Or: Python 3.11, Node 16+ and PostgreSQL for running services locally without Docker

---

## 1) Run the full stack locally with Docker (recommended)

From repository root:

```bash
docker-compose up --build
```

This compose file starts three services:

- `backend` (Django) — exposed on host `8000`
- `frontend` (React) — exposed on host `3000`
- `db` (Postgres) — internal DB port 5432 mapped to host 5433 by default

Notes:

- The backend container runs migrations automatically at startup (see `docker-compose.yml`). If you change models locally, re-run migrations inside the container or from your host dev environment.

Create a superuser inside the running backend container:

```bash
docker-compose exec backend python manage.py createsuperuser
```

To stop and remove containers, networks and volumes created by compose:

```bash
docker-compose down
```

---

## 2) Run services individually (development)

### Backend (local Python environment)

```bash
# create and activate venv
python -m venv .venv
source .venv/bin/activate

# install dependencies
pip install -r healthcare_backend/requirements.txt

# set required env vars (example)
export POSTGRES_DB=healthcare_db
export POSTGRES_USER=aditya
export POSTGRES_PASSWORD=aditya123
export DJANGO_SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")

# run migrations and start server
cd healthcare_backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend (React dev server)

```bash
cd healthcare-frontend
npm install
npm start
```

The React app expects the backend API at `http://localhost:8000` by default when running locally. You can change the API base URL in the frontend environment as needed.

---

## Environment variables

Summary of important environment variables (used by docker-compose / backend):

- `POSTGRES_DB` — database name (default: `healthcare_db`)
- `POSTGRES_USER` — DB user (default: `aditya`)
- `POSTGRES_PASSWORD` — DB password (default: `aditya123`)
- `DB_HOST` — internal DB host (in docker-compose: `db`)
- `DB_PORT` — DB port (default: `5432`)
- `DJANGO_SECRET_KEY` — Django secret key (generate with `get_random_secret_key()`)

Place backend env values in `healthcare_backend/.env` (the compose file references an env file).

To generate a Django secret key:

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

---

## API Endpoints (summary)

The backend exposes REST endpoints used by the frontend. Confirm the exact prefix in `healthcare_backend/healthcare_backend/urls.py` — the implementation shows endpoints under `/v1/...` in the `api/urls.py` file.

Authentication:

- `POST /api/v1/auth/register/` — Register a new user (username, email, password, password2, first_name, last_name)
- `POST /api/v1/auth/login/` — Obtain JWT tokens (username/password)
- `POST /api/v1/auth/token/refresh/` — Refresh JWT token
- `GET  /api/v1/auth/profile/` — Get current user's profile (Authorization: Bearer <access>)
- `POST /api/v1/auth/change-password/` — Change current user's password

Users (admin-only views):

- `GET  /api/v1/users/` — list users
- `GET/PUT /api/v1/users/<id>/` — retrieve or update user

Patients:

- `GET/POST /api/v1/patients/` — list or create patients
- `GET/PUT/DELETE /api/v1/patients/<id>/` — retrieve/update/delete patient

Doctors:

- `GET/POST /api/v1/doctors/` — list or create doctors
- `GET/PUT/DELETE /api/v1/doctors/<id>/` — retrieve/update/delete doctor

Patient-Doctor mappings:

- `GET/POST /api/v1/mappings/` — list or create mappings
- `GET /api/v1/mappings/patient/<patient_id>/` — list mappings by patient
- `GET/DELETE /api/v1/mappings/<id>/` — retrieve or delete a mapping

Other helper endpoints found in code:

- `GET /health/` — health-check
- `GET /v1/doctor/my-patients/` — (doctor role) get patients mapped to the current doctor
- `POST /v1/doctor/map-patient/` — (doctor role) map a patient to the authenticated doctor

Refer to `healthcare_backend/api/urls.py` for exact route names and implementations.

---

## Demo credentials (local/test only)

These example accounts are handy for local testing. You may need to create them manually via admin or fixtures.

- Admin (example): `admin` / `admin123` (use secure credentials in production)
- Doctor (example): `doctor` / `doctor123`
- Patient (example): `patient` / `patient123`

Do not use these credentials in production.

---

## Database migrations

When you change backend models, create and apply migrations:

```bash
cd healthcare_backend
python manage.py makemigrations
python manage.py migrate
```

In Docker:

```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

---

## Admin UI

Open `http://localhost:8000/admin/` and log in with a superuser to manage users, patients, doctors and mappings.

---

## Notes, tips & recommendations

- Many ForeignKey fields in the backend use `on_delete=models.CASCADE`. Deleting a parent (e.g., user) may remove related records (patients or doctors). If you want to preserve child records on parent deletion, consider `SET_NULL` with `null=True`.
- Keep `DJANGO_SECRET_KEY` and production credentials out of version control. Use environment variables or a secrets manager for production.
- For production, serve the frontend build statically (build React and serve via nginx or a CDN) and secure the backend with HTTPS, proper CORS and rate-limiting.

---

## Contributing

1. Fork the repository
2. Create a feature branch `git checkout -b feat/your-feature`
3. Add tests where applicable
4. Commit and open a Pull Request with a clear description
