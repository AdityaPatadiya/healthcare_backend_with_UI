from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin')
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
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    condition = models.TextField()

    def __str__(self):
        return self.name


class Doctor(models.Model):
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    contact = models.CharField(max_length=15)
    email = models.EmailField(unique=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self) -> str:
        return self.name


class PatientDoctorMapping(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['patient', 'doctor'], name='unique_patient_doctor')
        ]
    
    def __str__(self):
        return f"{self.patient.name} - {self.doctor.name}"









# from django.db import models
# from django.contrib.auth.models import User

# class UserProfile(models.Model):
#     ROLE_CHOICES = (
#         ('user', 'User'),
#         ('admin', 'Admin')
#     )
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    
#     def __str__(self):
#         return f"{self.user.username} - {self.role}"

# class Patient(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     name = models.CharField(max_length=100)
#     age = models.IntegerField()
#     gender = models.CharField(max_length=10)
#     address = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
#     condition = models.TextField()

#     def __str__(self):
#         return self.name

# class Doctor(models.Model):
#     name = models.CharField(max_length=100)
#     specialization = models.CharField(max_length=100)
#     contact = models.CharField(max_length=15)
#     email = models.EmailField(unique=True)
#     created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

#     def __str__(self) -> str:
#         return self.name

# class PatientDoctorMapping(models.Model):
#     patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
#     doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         constraints = [
#             models.UniqueConstraint(fields=['patient', 'doctor'], name='unique_patient_doctor')
#         ]
    
#     def __str__(self):
#         return f"{self.patient.name} - {self.doctor.name}"
