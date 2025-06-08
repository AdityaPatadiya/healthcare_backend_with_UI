from django.urls import path
from .views import (
    RegisterView, 
    PatientListCreateView, PatientDetailView,
    DoctorListCreateView, DoctorDetailView,
    PatientDoctorMappingView, PatientDoctorByPatientView, PatientDoctorMappingDeleteView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Patient endpoints
    path('patients/', PatientListCreateView.as_view(), name='patient-list-create'),
    path('patients/<int:pk>/', PatientDetailView.as_view(), name='patient-detail'),

    # Doctors endpoints
    path('doctors/', DoctorListCreateView.as_view(), name='doctor-list-create'),
    path('doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),

    # Patient-Doctor Mapping endpoints
    path('mappings/', PatientDoctorMappingView.as_view(), name='mapping-list-create'),
    path('mappings/<int:patient_id>/', PatientDoctorByPatientView.as_view(), name='mapping-by-patient'),
    path('mappings/delete/<int:pk>/', PatientDoctorMappingDeleteView.as_view(), name='mapping-delete'),

    # refresh the Token
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh')
]
