# healthcare_backend

## APIs to be Implemented

### 1. Authentication APIs

`POST /api/auth/register/` – Register a new user with name, email, and password.

`POST /api/auth/login/` – Log in a user and return a JWT token.

### 2. Patient Management APIs

`POST /api/patients/` – Create a new patient (Authenticated users only).

`GET /api/patients/` – Retrieve all patients created by the authenticated user.

`GET /api/patients/<id>/` – Get details of a specific patient.

`PUT /api/patients/<id>/` – Update patient details.

`DELETE /api/patients/<id>/` – Delete a patient record.

### 3. Doctor Management APIs

`POST /api/doctors/` – Create a new doctor (Authenticated users only).

`GET /api/doctors/` – Retrieve all doctors.

`GET /api/doctors/<id>/` – Get details of a specific doctor.

`PUT /api/doctors/<id>/` – Update doctor details.

`DELETE /api/doctors/<id>/` – Delete a doctor record.

### 4. Patient-Doctor Mapping APIs

`POST /api/mappings/` – Assign a doctor to a patient.

`GET /api/mappings/` – Retrieve all patient-doctor mappings.

`GET /api/mappings/<patient_id>/` – Get all doctors assigned to a specific patient.

`DELETE /api/mappings/<id>/` – Remove a doctor from a patient.

### 5. Refresh Token API

`POST /api/token/refresh` – Issue a new JWT token using the refresh token.

---

## Included Technologies
1. Python RESTAPI
2. postgresql
3. redis-server
---

## 🔧 How to Run the Project

Follow these steps to set up and run the project:

1. Clone the repo:

    ```bash
    git clone https://github.com/AdityaPatadiya/helthcare_backend.git
    cd helthcare_backend
    ```

2. Create and activate a virtual environment:

    ```bash
    python -m venv venv
    venv\Scripts\activate  # On Windows
    # source venv/bin/activate  # On Linux/Mac
    ```

3. Install required libraries:

    ```bash
    pip install -r requirements.txt
    ```

4. Set up PostgreSQL:

    - Create a PostgreSQL database and user.
    - Start PostgreSQL:

      ```bash
      sudo service postgresql start
      ```

5. Generate a Django secret key:

    ```bash
    python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
    ```

6. Create and update `.env` file:

    ```bash
    cp .env.example .env
    ```

    Update the file with your credentials and secret key.

7. Set required PostgreSQL permissions:

    ```sql
    GRANT ALL ON SCHEMA public TO <your_username>;
    GRANT CREATE ON SCHEMA public TO <your_username>;
    ```

8. Apply database migrations:

    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

9. Start Redis server:

    ```bash
    redis-server
    ```

10. Access the Telegram bot:

    - Create a bot via [BotFather](https://t.me/BotFather)
    - Get the Token from the BotFather
    - update the .env file.

11. Start the three required servers:

    ```bash
    # Run the Django server
    python manage.py runserver

    # Start the Celery worker
    celery -A healthcare_backend worker --loglevel=INFO

    # Start the Telegram bot script
    python api/telegram_bot.py
    ```

---

> [!WARNING]
> While testing the endpoints, always include a trailing `/` in your URLs to avoid 301/404 issues.

---
