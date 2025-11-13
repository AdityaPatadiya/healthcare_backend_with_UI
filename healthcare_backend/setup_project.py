import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Doctor, Patient, PatientDoctorMapping

User = get_user_model()

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
        is_approved=doctor_data.get('is_approved', True),
        created_by=created_by
    )

def setup_project():
    print("🚀 Setting up healthcare system...")
    
    # Default admin user - CREATE OR UPDATE with admin role
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@healthcare.com',
            'is_staff': True,
            'is_superuser': True,
            'role': 'admin'
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("✅ Default admin user created:")
    else:
        # Update existing admin user to have admin role
        admin_user.role = 'admin'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.set_password('admin123')
        admin_user.save()
        print("✅ Existing admin user updated:")
    
    print("   Username: admin")
    print("   Password: admin123")
    print("   Email: admin@healthcare.com")
    print("   Role: admin")

    # Demo doctor user
    if not User.objects.filter(username='doctor').exists():
        doctor_user = User.objects.create_user(
            username='doctor',
            email='doctor@healthcare.com',
            password='doctor123',
            first_name='John',
            last_name='Doctor',
            role='doctor'
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
        print("✅ Demo doctor user and profile created:")
        print("   Username: doctor")
        print("   Password: doctor123")
        print("   Specialization: Cardiology")
        print("   Contact: 1234567890")
    else:
        doctor_user = User.objects.get(username='doctor')
        if doctor_user.role != 'doctor':
            doctor_user.role = 'doctor'
            doctor_user.save()
            print("✅ Updated doctor user role to 'doctor'")
        else:
            print("ℹ️  Doctor user already exists")

    # Demo patient user  
    if not User.objects.filter(username='patient').exists():
        patient_user = User.objects.create_user(
            username='patient',
            email='patient@healthcare.com',
            password='patient123',
            first_name='Alice',
            last_name='Patient',
            role='patient'
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
        print("✅ Demo patient user and profile created:")
        print("   Username: patient")
        print("   Password: patient123")
        print("   Condition: Regular checkup required")
    else:
        patient_user = User.objects.get(username='patient')
        if patient_user.role != 'patient':
            patient_user.role = 'patient'
            patient_user.save()
            print("✅ Updated patient user role to 'patient'")
        else:
            print("ℹ️  Patient user already exists")

    # Create sample patient-doctor mapping
    try:
        doctor_profile = Doctor.objects.get(email='doctor@healthcare.com')
        patient_profile = Patient.objects.get(user=patient_user)
        
        if not PatientDoctorMapping.objects.filter(patient=patient_profile, doctor=doctor_profile).exists():
            mapping = PatientDoctorMapping.objects.create(
                patient=patient_profile,
                doctor=doctor_profile
            )
            print("✅ Patient-Doctor mapping created:")
            print(f"   {patient_profile.full_name} → {doctor_profile.full_name}")
        else:
            print("ℹ️  Patient-Doctor mapping already exists")
            
    except Exception as e:
        print(f"⚠️  Could not create patient-doctor mapping: {e}")

    # Create additional demo doctors with different specializations
    specializations = [
        ('Neurology', 'Dr. Sarah Neuro', 'neurologist@healthcare.com', '1112223333', 'NEURO123456', 8),
        ('Pediatrics', 'Dr. Mike Child', 'pediatrician@healthcare.com', '4445556666', 'PEDIA123456', 12),
        ('Orthopedics', 'Dr. David Bone', 'orthopedic@healthcare.com', '7778889999', 'ORTHO123456', 15),
        ('Dermatology', 'Dr. Emily Skin', 'dermatologist@healthcare.com', '0001112222', 'DERMA123456', 7)
    ]

    for specialization, name, email, contact, license_num, exp_years in specializations:
        username = specialization.lower()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'password': f'{username}123',
                'first_name': name.split()[1],
                'last_name': name.split()[2],
                'role': 'doctor'
            }
        )
        
        if created:
            user.set_password(f'{username}123')
            user.save()
            # Create doctor profile with new fields
            Doctor.objects.create(
                user=user,
                full_name=name,
                email=email,
                specializations=[specialization],
                license_number=license_num,
                years_of_experience=exp_years,
                contact_number=contact,
                is_approved=True,
                created_by=admin_user
            )
            print(f"✅ {specialization} doctor created:")
            print(f"   Username: {username}")
            print(f"   Password: {username}123")
            print(f"   Specialization: {specialization}")
        else:
            if user.role != 'doctor':
                user.role = 'doctor'
                user.save()
                print(f"✅ Updated {username} user role to 'doctor'")

    # Create additional demo patients
    demo_patients = [
        ('Bob Smith', 'bob@healthcare.com', 45, 'Male', '456 Oak Avenue, City, State', 'Hypertension', '9876543211', 'bob'),
        ('Carol Johnson', 'carol@healthcare.com', 28, 'Female', '789 Pine Road, City, State', 'Diabetes management', '9876543212', 'carol'),
        ('David Wilson', 'david@healthcare.com', 60, 'Male', '321 Elm Street, City, State', 'Arthritis treatment', '9876543213', 'david')
    ]

    for name, email, age, gender, address, condition, contact, username in demo_patients:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'password': f'{username}123',
                'first_name': name.split()[0],
                'last_name': name.split()[1],
                'role': 'patient'
            }
        )
        
        if created:
            user.set_password(f'{username}123')
            user.save()
            # Create patient profile with new fields
            Patient.objects.create(
                user=user,
                full_name=name,
                email=email,
                age=age,
                gender=gender,
                contact_number=contact,
                medical_history=condition
            )
            print(f"✅ Demo patient created:")
            print(f"   Username: {username}")
            print(f"   Password: {username}123")
            print(f"   Condition: {condition}")
        else:
            if user.role != 'patient':
                user.role = 'patient'
                user.save()
                print(f"✅ Updated {username} user role to 'patient'")

    # Final verification of all user roles
    print("\n🔍 Verifying all user roles...")
    for user in User.objects.all():
        print(f"   {user.username}: {user.role} (staff: {user.is_staff}, superuser: {user.is_superuser})")

    print("\n🎉 Setup completed successfully!")
    print("\n📋 Default Login Credentials:")
    print("   Admin Panel: http://localhost:8000/admin/")
    print("   - Admin:     admin / admin123")
    print("\n   Frontend Application:")
    print("   - Doctor:    doctor / doctor123 (Cardiology)")
    print("   - Patient:   patient / patient123")
    print("   - Neurologist: neurology / neurology123")
    print("   - Pediatrician: pediatrics / pediatrics123")
    print("   - Orthopedic:   orthopedics / orthopedics123")
    print("   - Dermatologist: dermatology / dermatology123")
    print("\n   Additional Demo Patients:")
    print("   - Bob:       bob / bob123 (Hypertension)")
    print("   - Carol:     carol / carol123 (Diabetes)")
    print("   - David:     david / david123 (Arthritis)")

if __name__ == '__main__':
    setup_project()
