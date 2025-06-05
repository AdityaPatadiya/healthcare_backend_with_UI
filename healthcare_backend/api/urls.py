from django.urls import path
from .views import RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]
