from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        user = self.create_user(username, email, password, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient')
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='customer_set',
        related_query_name='customuser'
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='customer_set',
        related_query_name='customuser'
    )

    class Meta:
        db_table = 'custom_user'

    def __str__(self):
        return self.username


class Patient(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other')
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100, default='')
    email = models.EmailField(blank=True, null=True)
    age = models.IntegerField(default=0)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Other')
    contact_number = models.CharField(max_length=15, default='')
    medical_history = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class Doctor(models.Model):
    SPECIALIZATION_CHOICES = (
        ('Cardiology', 'Cardiology'),
        ('Dermatology', 'Dermatology'),
        ('Pediatrics', 'Pediatrics'),
        ('Neurology', 'Neurology'),
        ('Orthopedics', 'Orthopedics'),
        ('Psychiatry', 'Psychiatry'),
        ('General Practice', 'General Practice'),
        ('Dentistry', 'Dentistry'),
        ('Surgery', 'Surgery'),
        ('Radiology', 'Radiology'),
    )
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='doctor_profile'
    )
    full_name = models.CharField(max_length=100, default='')
    email = models.EmailField(unique=True)
    specializations = models.JSONField(default=list)  # Store as list of strings
    license_number = models.CharField(max_length=50, blank=True, default='')
    years_of_experience = models.IntegerField(default=0)
    contact_number = models.CharField(max_length=15, default='')
    is_approved = models.BooleanField(default=False)  # Admin approval required
    created_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='created_doctors'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.full_name} ({', '.join(self.specializations)})"


class PatientDoctorMapping(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['patient', 'doctor'], name='unique_patient_doctor')
        ]
    
    def __str__(self):
        return f"{self.patient.full_name} - {self.doctor.full_name}"
