from django.urls import path
from .views import (
    RegisterView, UserProfileView, UserListView, UserDetailView,
    PatientListCreateView, PatientDetailView,
    DoctorListCreateView, DoctorDetailView,
    PatientDoctorMappingListCreateView, PatientDoctorMappingDetailView, 
    PatientDoctorByPatientView,
    ChangePasswordView, SystemSettingsView, UserActivityView,
    DoctorSelfPatientsView, DoctorMapPatientView,
    health_check, LoginView, DoctorApprovalView, PendingDoctorsView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('health/', health_check, name='health_check'),

    # Authentication
    path('v1/auth/register/', RegisterView.as_view(), name='register'),
    path('v1/auth/login/', LoginView.as_view(), name='login'),  # New login endpoint
    path('v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('v1/auth/profile/', UserProfileView.as_view(), name='user-profile'),
    path('v1/auth/change-password/', ChangePasswordView.as_view(), name='change-password'),

    # User management (admin only)
    path('v1/users/', UserListView.as_view(), name='user-list'),
    path('v1/users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),

    # System settings (admin only)
    path('v1/system-settings/', SystemSettingsView.as_view(), name='system-settings'),

    # Patient endpoints
    path('v1/patients/', PatientListCreateView.as_view(), name='patient-list-create'),
    path('v1/patients/<int:pk>/', PatientDetailView.as_view(), name='patient-detail'),

    # Doctor endpoints
    path('v1/doctors/', DoctorListCreateView.as_view(), name='doctor-list-create'),
    path('v1/doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    path('v1/doctors/pending/', PendingDoctorsView.as_view(), name='pending-doctors'),
    path('v1/doctors/<int:doctor_id>/approve/', DoctorApprovalView.as_view(), name='doctor-approval'),

    # Patient-Doctor Mapping endpoints
    path('v1/mappings/', PatientDoctorMappingListCreateView.as_view(), name='mapping-list-create'),
    path('v1/mappings/<int:pk>/', PatientDoctorMappingDetailView.as_view(), name='mapping-detail'),
    path('v1/mappings/patient/<int:patient_id>/', PatientDoctorByPatientView.as_view(), name='mapping-by-patient'),

    # Doctor-specific endpoints
    path('v1/doctor/my-patients/', DoctorSelfPatientsView.as_view(), name='doctor-my-patients'),
    path('v1/doctor/map-patient/', DoctorMapPatientView.as_view(), name='doctor-map-patient'),
]
