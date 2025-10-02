from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Patient, Doctor, PatientDoctorMapping

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'age', 'gender', 'created_at')
    list_filter = ('gender', 'created_at')
    search_fields = ('name', 'user__username')

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialization', 'contact', 'email')
    search_fields = ('name', 'specialization', 'email')

@admin.register(PatientDoctorMapping)
class PatientDoctorMappingAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'created_at')
    list_filter = ('created_at',)
