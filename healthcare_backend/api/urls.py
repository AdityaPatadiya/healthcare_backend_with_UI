from django.urls import path
from .views import (
    RegisterView, 
    PatientListCreateView, PatientDetailView,
    DoctorListCreateView, DoctorDetailView
)
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('patient/', PatientListCreateView.as_view(), name='patient-list-create'),
    path('patient/<int:pk>/', PatientDetailView.as_view(), name='patient-detail'),
    path('doctors/', DoctorListCreateView.as_view(), name='doctor-list-create'),
    path('patient/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
]
