# Healthcare Backend API

## Overview

This project is a **Healthcare Management Backend API** built with Django REST Framework, PostgreSQL, Redis, and JWT authentication. It provides endpoints for:

- Authentication (register, login, JWT refresh)
- Patient management
- Doctor management
- Patient-Doctor mapping
- User and system management

---

## APIs

### 1. Authentication APIs
- `POST /api/v1/auth/register/` – Register a new user  
- `POST /api/v1/auth/login/` – Login and get JWT token  
- `POST /api/v1/auth/token/refresh/` – Refresh JWT token  
- `GET /api/v1/auth/profile/` – Get authenticated user profile  
- `POST /api/v1/auth/change-password/` – Change user password  

### 2. Patient Management APIs
- `POST /api/v1/patients/` – Create a patient  
- `GET /api/v1/patients/` – Retrieve all patients  
- `GET /api/v1/patients/<id>/` – Get specific patient  
- `PUT /api/v1/patients/<id>/` – Update patient  
- `DELETE /api/v1/patients/<id>/` – Delete patient  

### 3. Doctor Management APIs
- `POST /api/v1/doctors/` – Create a doctor  
- `GET /api/v1/doctors/` – Retrieve all doctors  
- `GET /api/v1/doctors/<id>/` – Get specific doctor  
- `PUT /api/v1/doctors/<id>/` – Update doctor  
- `DELETE /api/v1/doctors/<id>/` – Delete doctor  

### 4. Patient-Doctor Mapping APIs
- `POST /api/v1/mappings/` – Assign a doctor to a patient  
- `GET /api/v1/mappings/` – Retrieve all mappings  
- `GET /api/v1/mappings/patient/<patient_id>/` – Get all doctors for a patient  
- `DELETE /api/v1/mappings/<id>/` – Remove doctor from patient  

---

## Technologies Used
- Python 3.11  
- Django REST Framework  
- PostgreSQL 16  
- Redis  
- JWT Authentication  
- Docker & Docker Compose  

---

## Docker Setup

### 1. Clone the repository

```bash
git clone https://github.com/AdityaPatadiya/helthcare_backend.git
cd helthcare_backend
```

### 2. Build and start Docker containers
```bash
docker-compose up --build
```

### 3. Create Superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```


## Default Login Credentials

After starting the application, you can use these default credentials:

### Admin Panel (Django Admin)
- **URL**: http://localhost:8000/admin/
- **Username**: admin
- **Password**: admin123
- **Email**: admin@healthcare.com

### Demo Users (Frontend)
- **Doctor**: 
  - Username: doctor
  - Password: doctor123
- **Patient**:
  - Username: patient  
  - Password: patient123


## Notes
- All API endpoints require a trailing /

- Backend URL for frontend container: http://backend:3000

- Host machine backend URL: http://localhost:8000

## Useful Docker Commands
```bash
# Start containers
docker-compose up

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Run shell inside backend container
docker-compose exec backend sh
```

## Environment variaables
```bash
POSTGRES_DB=healthcare_db
POSTGRES_USER=aditya
POSTGRES_PASSWORD=aditya123
DJANGO_SECRET_KEY=your_generated_secret_key
```

### Generate the Django secret key:
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```
