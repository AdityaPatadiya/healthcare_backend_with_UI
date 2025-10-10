import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

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
    
    # Patient user (regular user with patient role)
    patient_user = create_user_with_role(
        username='patient',
        email='patient@healthcare.com',
        password='patient123',
        role='patient',
        first_name='Alice',
        last_name='Patient'
    )
    
    print("✅ All default users created successfully!")
    print("\n📋 Default Login Credentials:")
    print("   Admin:    admin / admin123 (Django Admin & Frontend)")
    print("   Doctor:   doctor / doctor123 (Frontend)")
    print("   Patient:  patient / patient123 (Frontend)")

if __name__ == '__main__':
    setup_project()
