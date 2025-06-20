# helthcare_backend
## APIs to be Implemented:

### 1. Authentication APIs

`POST /api/auth/register/` - Register a new user with name, email, and password.

`POST /api/auth/login/` - Log in a user and return a JWT token.
### 2. Patient Management APIs
`POST /api/patients/` - Add a new patient (Authenticated users only).

`GET /api/patients/` - Retrieve all patients created by the authenticated user.

`GET /api/patients/<id>/` - Get details of a specific patient.

`PUT /api/patients/<id>/` - Update patient details.

`DELETE /api/patients/<id>/` - Delete a patient record.


### 3. Doctor Management APIs
`POST /api/doctors/` - Add a new doctor (Authenticated users only).

`GET /api/doctors/` - Retrieve all doctors.

`GET /api/doctors/<id>/` - Get details of a specific doctor.

`PUT /api/doctors/<id>/` - Update doctor details.

`DELETE /api/doctors/<id>/` - Delete a doctor record.


### 4. Patient-Doctor Mapping APIs
`POST /api/mappings/` - Assign a doctor to a patient.

`GET /api/mappings/` - Retrieve all patient-doctor mappings.

`GET /api/mappings/<patient_id>/` - Get all doctors assigned to a specific patient.

`DELETE /api/mappings/<id>/` - Remove a doctor from a patient.


## 5. Refresh Token API
`POST /api/token/refresh` - Assign new token to the user.


## How to run the project?
Follow the step-by-step process to download and successfully run this project:

1. clone this repo with `git clone https://github.com/AdityaPatadiya/helthcare_backend.git`.
2. `python -m venv venv`
3. `venv\Scripts\activate`
4. Install the required libraries
   ```
   pip install -r requirements.txt
   ```
5. Create a postgresql database.
6. Create a user and password and start the postgresql service by the command `sudo service postgresql start`.
    ```
7. The secret key can be generated using:
    ```
    python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
    ```
8. Create a `.env` file from the `.env.example` using command: `cp .env.example .env` and update all the required value there (along with your secret key).
9. ```
    python manage.py makemigrations
    python manage.py migrate
    ```
10. change some settings of the postgresql by entering in the postgresql:
    ```
    ALTER USER your_db_user CREATEDB;
    ```
11. run the test for testing the project:
    ```
    python manage.py test api
    ```

This step will help to build the project and test the endpoints with the test cases.

We can use postman or any api testing tool to manually testing the api endpoints.

