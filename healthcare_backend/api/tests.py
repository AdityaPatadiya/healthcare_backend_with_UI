from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from .models import Patient, Doctor, PatientDoctorMapping
import json


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        self.client = APIClient()

    def test_user_registration(self):
        url = reverse('register')
        response = self.client.post(url, self.user_data, format='json')
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('access' in content)
        self.assertTrue('refresh' in content)
        self.assertEqual(User.objects.count(), 1)
    
    def test_suer_login(self):
        User.objects.create_user(**self.user_data)
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }, format='json')
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in content)
    

class PatientTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.patient_data = {
            'name': 'John Doe',
            'age': 30,
            'gender': 'Male',
            'address': '123 Main St',
            'condition': 'Healthy'
        }
    
    def test_create_patieht(self):
        url = reverse('patient-list-create')
        response = self.client.post(url, self.patient_data, format='json')
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Patient.objects.count(), 1)
        self.assertEqual(Patient.objects.get().name, 'John Doe')
        self.assertEqual(Patient.objects.get().user, self.user)

    def test_retrieve_patients(self):
        Patient.objects.create(user=self.user, **self.patient_data)
        url = reverse('patient-list-create')
        response = self.client.get(url)
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), 1)
        self.assertEqual(content[0]['name'], 'John Doe')
    
    def test_retrieve_single_patient(self):
        patient = Patient.objects.create(user=self.user, **self.patient_data)
        url = reverse('patient-detail', kwargs={'pk': patient.pk})
        response = self.client.get(url)
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(content['name'], 'John Doe')

    def test_update_patient(self):
        patient = Patient.objects.create(user=self.user, **self.patient_data)
        url = reverse('patient-detail', kwargs={'pk': patient.pk})
        update_data = {'name': 'John Updated', 'age': 35}
        response = self.client.put(url, update_data, format='json')
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        patient.refresh_from_db()
        self.assertEqual(patient.name, 'John Updated')
        self.assertEqual(patient.age, 35)
    
    def test_delete_patient(self):
        patient = Patient.objects.create(user=self.user, **self.patient_data)
        url = reverse('patient-detail', kwargs={'pk': patient.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Patient.objects.count(), 0)
    

class DoctorTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='admin',
            password='adminpass',
            is_staff=True
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.doctor_data = {
            'name': 'Dr. Smith',
            'specialization': 'Cardiology',
            'contact': '123-456-7890',
            'email': 'smith@example.com'
        }
    
    def test_create_doctor(self):
        url = reverse('doctor-list-create')
        response = self.client.post(url, self.doctor_data, format='json')
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Doctor.objects.count(), 1)
        self.assertEqual(Doctor.objects.get().name, 'Dr. Smith')
    
    def test_retrieve_doctors(self):
        Doctor.objects.create(**self.doctor_data)
        url = reverse('doctor-list-create')
        response = self.client.get(url)
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), 1)
        self.assertEqual(content[0]['name'], 'Dr. Smith')
    
    def test_retrieve_single_doctor(self):
        doctor = Doctor.objects.create(**self.doctor_data)
        url = reverse('doctor-detail', kwargs={'pk': doctor.pk})
        response = self.client.get(url)
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(content['name'], 'Dr. Smith')

    def test_update_doctor(self):
        doctor = Doctor.objects.create(**self.doctor_data)
        url = reverse('doctor-detail', kwargs={'pk': doctor.pk})
        updated_data = {'specialization': "Neurology", 'contact': '987-654-3210'}
        response = self.client.put(url, updated_data, format='json')
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        doctor.refresh_from_db()
        self.assertEqual(doctor.specialization, 'Neurology')
        self.assertEqual(doctor.contact, '987-654-3210')
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        doctor.refresh_from_db()
        self.assertEqual(doctor.specialization, 'Neurology')
        self.assertEqual(doctor.contact, '987-654-3210')

    def test_delete_doctor(self):
        doctor = Doctor.objects.create(**self.doctor_data)
        url = reverse('doctor-detail', kwargs={'pk':doctor.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Doctor.objects.count(), 0)


class PatirntDoctorMappingTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username = 'testuser',
            password = 'testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.patient = Patient.objects.create(
            user=self.user,
            name='Patient X',
            age=40,
            gender='Female',
            address='456 Oak St',
            condition='Diabetes'
        )

        self.doctor1 = Doctor.objects.create(
            name='Dr. Johnson',
            specialization='Endocrinology',
            contact='555-1234',
            email='jognson@example.com'
        )
        self.doctor2 = Doctor.objects.create(
            name='Dr. Williams',
            specialization='Internal Medicine',
            contact='555-5678',
            email='williams@example.com'
        )

    def test_create_mapping(self):
        url = reverse('mapping-list-create')
        data = {'patient': self.patient.pk, 'doctor': self.doctor1.pk}
        response = self.client.post(url, data, format='json')
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PatientDoctorMapping.objects.count(), 1)

    def test_retrieve_mapping(self):
        mapping = PatientDoctorMapping.objects.create(
            patient=self.patient,
            doctor=self.doctor1
        )
        url = reverse('mapping-list-create')
        response = self.client.get(url)
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), 1)
        self.assertEqual(content[0]['patient'], self.patient.pk)
        self.assertEqual(content[0]['doctor'], self.doctor1.pk)

    def test_retrieve_mappings_by_patient(self):
        PatientDoctorMapping.objects.create(patient=self.patient, doctor=self.doctor1)
        PatientDoctorMapping.objects.create(patient=self.patient, doctor=self.doctor2)

        url = reverse('mapping-by-patient', kwargs={'patient_id': self.patient.pk})
        response = self.client.get(url)
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(content), 2)
        self.assertEqual(content[0]['patient'], self.patient.pk)
        self.assertEqual(content[1]['patient'], self.patient.pk)

    def test_delete_mapping(self):
        mapping = PatientDoctorMapping.objects.create(
            patient=self.patient,
            doctor=self.doctor1
        )
        url = reverse('mapping-delete', kwargs={'pk':mapping.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(PatientDoctorMapping.objects.count(), 0)

    def test_unique_mapping_constraint(self):
        PatientDoctorMapping.objects.create(
            patient=self.patient,
            doctor=self.doctor1
        )

        url = reverse('mapping-list-create')
        data = {'patient': self.patient.pk, 'doctor': self.doctor1.pk}
        response = self.client.post(url, data, format='json')
        content = json.loads(response.content)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', content)


class PermissionTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def test_unauthenticated_access(self):
        user = User.objects.create_user('user1', 'pass1')
        patient = Patient.objects.create(
            user=user,
            name='Test Patient',
            age=25,
            gender='Male',
            address='Test Address',
            condition='Test Condidion'
        )

        endpoints = [
            reverse('patient-list-create'),
            reverse('patient-detail', kwargs={'pk': patient.pk}),
            reverse('doctor-list-create'),
            reverse('doctor-detail', kwargs={'pk': 1}),
            reverse('mapping-list-create'),
            reverse('mapping-by-patient', kwargs={'patient_id': patient.pk})
        ]

        for url in endpoints:
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patient_ownership(self):
        user1 = User.objects.create_user('user1', 'pass1')
        user2 = User.objects.create_user('user2', 'pass2')

        patient = Patient.objects.create(
            user = user1,
            name='User1 Patient',
            age=30,
            gender='Female',
            address='Address1',
            condition='Condition1'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=user2)

        url = reverse('patient-detail', kwargs={'pk': patient.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        update_data = {'name': 'Updated Name'}
        response = self.client.put(url, update_data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
