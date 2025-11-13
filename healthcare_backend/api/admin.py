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
    list_display = ('full_name', 'user', 'email', 'age', 'gender', 'contact_number', 'created_at')
    list_filter = ('gender', 'created_at')
    search_fields = ('full_name', 'user__username', 'email')

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'license_number', 'years_of_experience', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('full_name', 'email', 'license_number')
    actions = ['approve_doctors', 'reject_doctors']
    
    def approve_doctors(self, request, queryset):
        updated = queryset.update(is_approved=True)
        # Also activate user accounts
        for doctor in queryset:
            if doctor.user:
                doctor.user.is_active = True
                doctor.user.save()
        self.message_user(request, f"{updated} doctors were approved.")
    approve_doctors.short_description = "Approve selected doctors"
    
    def reject_doctors(self, request, queryset):
        updated = queryset.update(is_approved=False)
        # Also deactivate user accounts
        for doctor in queryset:
            if doctor.user:
                doctor.user.is_active = False
                doctor.user.save()
        self.message_user(request, f"{updated} doctors were rejected.")
    reject_doctors.short_description = "Reject selected doctors"

@admin.register(PatientDoctorMapping)
class PatientDoctorMappingAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'created_at')
    list_filter = ('created_at',)
