import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Doctor, Patient, PatientDoctorMapping

User = get_user_model()

def setup_project():
    print("🚀 Setting up healthcare system...")
    
    # Default admin user - CREATE OR UPDATE with admin role
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@healthcare.com',
            'is_staff': True,
            'is_superuser': True,
            'role': 'admin'  # Explicitly set role to admin
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
        admin_user.set_password('admin123')  # Ensure password is set
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
        # Create doctor profile WITHOUT user field for now
        doctor_profile = Doctor.objects.create(
            name='Dr. John Doctor',
            specialization='Cardiology',
            contact='1234567890',
            email='doctor@healthcare.com',
            created_by=admin_user
        )
        print("✅ Demo doctor user and profile created:")
        print("   Username: doctor")
        print("   Password: doctor123")
        print("   Specialization: Cardiology")
        print("   Contact: 1234567890")
    else:
        doctor_user = User.objects.get(username='doctor')
        # Ensure doctor role is set
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
        # Create patient profile
        patient_profile = Patient.objects.create(
            user=patient_user,
            name='Alice Patient',
            age=30,
            gender='Female',
            address='123 Main Street, City, State',
            condition='Regular checkup required'
        )
        print("✅ Demo patient user and profile created:")
        print("   Username: patient")
        print("   Password: patient123")
        print("   Condition: Regular checkup required")
    else:
        patient_user = User.objects.get(username='patient')
        # Ensure patient role is set
        if patient_user.role != 'patient':
            patient_user.role = 'patient'
            patient_user.save()
            print("✅ Updated patient user role to 'patient'")
        else:
            print("ℹ️  Patient user already exists")

    # Create sample patient-doctor mapping
    try:
        # Get the doctor and patient profiles
        doctor_profile = Doctor.objects.get(email='doctor@healthcare.com')
        patient_profile = Patient.objects.get(user=patient_user)
        
        # Check if mapping already exists
        if not PatientDoctorMapping.objects.filter(patient=patient_profile, doctor=doctor_profile).exists():
            mapping = PatientDoctorMapping.objects.create(
                patient=patient_profile,
                doctor=doctor_profile
            )
            print("✅ Patient-Doctor mapping created:")
            print(f"   {patient_profile.name} → {doctor_profile.name}")
        else:
            print("ℹ️  Patient-Doctor mapping already exists")
            
    except Exception as e:
        print(f"⚠️  Could not create patient-doctor mapping: {e}")

    # Create additional demo doctors with different specializations
    specializations = [
        ('Neurology', 'Dr. Sarah Neuro', 'neurologist@healthcare.com', '1112223333'),
        ('Pediatrics', 'Dr. Mike Child', 'pediatrician@healthcare.com', '4445556666'),
        ('Orthopedics', 'Dr. David Bone', 'orthopedic@healthcare.com', '7778889999'),
        ('Dermatology', 'Dr. Emily Skin', 'dermatologist@healthcare.com', '0001112222')
    ]

    for specialization, name, email, contact in specializations:
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
            # Create doctor profile WITHOUT user field for now
            Doctor.objects.create(
                name=name,
                specialization=specialization,
                contact=contact,
                email=email,
                created_by=admin_user
            )
            print(f"✅ {specialization} doctor created:")
            print(f"   Username: {username}")
            print(f"   Password: {username}123")
            print(f"   Specialization: {specialization}")
        else:
            # Update existing user role if needed
            if user.role != 'doctor':
                user.role = 'doctor'
                user.save()
                print(f"✅ Updated {username} user role to 'doctor'")

    # Create additional demo patients
    demo_patients = [
        ('Bob Smith', 45, 'Male', '456 Oak Avenue, City, State', 'Hypertension', 'bob'),
        ('Carol Johnson', 28, 'Female', '789 Pine Road, City, State', 'Diabetes management', 'carol'),
        ('David Wilson', 60, 'Male', '321 Elm Street, City, State', 'Arthritis treatment', 'david')
    ]

    for name, age, gender, address, condition, username in demo_patients:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{username}@healthcare.com',
                'password': f'{username}123',
                'first_name': name.split()[0],
                'last_name': name.split()[1],
                'role': 'patient'
            }
        )
        
        if created:
            user.set_password(f'{username}123')
            user.save()
            # Create patient profile
            Patient.objects.create(
                user=user,
                name=name,
                age=age,
                gender=gender,
                address=address,
                condition=condition
            )
            print(f"✅ Demo patient created:")
            print(f"   Username: {username}")
            print(f"   Password: {username}123")
            print(f"   Condition: {condition}")
        else:
            # Update existing user role if needed
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
