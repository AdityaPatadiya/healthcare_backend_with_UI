import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Doctor, Patient

User = get_user_model()

def create_user_with_role(username, email, password, role, first_name="", last_name="", is_superuser=False, is_staff=False):
    """Create a user with specific role"""
    if User.objects.filter(username=username).exists():
        print(f"ℹ️  User {username} already exists")
        return User.objects.get(username=username)
    
    if is_superuser:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
    else:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=is_staff
        )
    
    # Set the role if the field exists
    if hasattr(user, 'role'):
        user.role = role
        user.save()
    
    return user

def create_patient_profile(user, patient_data):
    """Create patient profile with new fields"""
    return Patient.objects.create(
        user=user,
        full_name=patient_data.get('full_name', user.get_full_name() or user.username),
        email=patient_data.get('email', user.email),
        age=patient_data.get('age', 0),
        gender=patient_data.get('gender', 'Other'),
        contact_number=patient_data.get('contact_number', ''),
        medical_history=patient_data.get('medical_history', '')
    )

def create_doctor_profile(user, doctor_data, created_by):
    """Create doctor profile with new fields"""
    return Doctor.objects.create(
        user=user,
        full_name=doctor_data.get('full_name', user.get_full_name() or user.username),
        email=doctor_data.get('email', user.email),
        specializations=doctor_data.get('specializations', []),
        license_number=doctor_data.get('license_number', ''),
        years_of_experience=doctor_data.get('years_of_experience', 0),
        contact_number=doctor_data.get('contact_number', ''),
        is_approved=doctor_data.get('is_approved', True),  # Auto-approve demo doctors
        created_by=created_by
    )

def setup_project():
    print("🚀 Setting up default users...")
    
    # Admin user (superuser with admin role)
    admin_user = create_user_with_role(
        username='admin',
        email='admin@healthcare.com',
        password='admin123',
        role='admin',
        first_name='System',
        last_name='Administrator',
        is_superuser=True,
        is_staff=True
    )
    
    # Doctor user (staff user with doctor role)
    doctor_user = create_user_with_role(
        username='doctor',
        email='doctor@healthcare.com',
        password='doctor123',
        role='doctor',
        first_name='John',
        last_name='Doctor',
        is_staff=True
    )
    
    # Create doctor profile with new fields
    doctor_profile = create_doctor_profile(
        doctor_user,
        {
            'full_name': 'Dr. John Doctor',
            'specializations': ['Cardiology'],
            'license_number': 'CARD123456',
            'years_of_experience': 10,
            'contact_number': '1234567890',
            'is_approved': True
        },
        admin_user
    )
    
    # Patient user (regular user with patient role)
    patient_user = create_user_with_role(
        username='patient',
        email='patient@healthcare.com',
        password='patient123',
        role='patient',
        first_name='Alice',
        last_name='Patient'
    )
    
    # Create patient profile with new fields
    patient_profile = create_patient_profile(
        patient_user,
        {
            'full_name': 'Alice Patient',
            'age': 30,
            'gender': 'Female',
            'contact_number': '9876543210',
            'medical_history': 'Regular checkup required'
        }
    )
    
    print("✅ All default users created successfully!")
    print("\n📋 Default Login Credentials:")
    print("   Admin:    admin / admin123 (Django Admin & Frontend)")
    print("   Doctor:   doctor / doctor123 (Frontend)")
    print("   Patient:  patient / patient123 (Frontend)")

if __name__ == '__main__':
    setup_project()
# 