from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.core.exceptions import PermissionDenied
from .models import Patient, Doctor, PatientDoctorMapping, CustomUser
from .serializers import PatientSerializer, RegisterSerializer, DoctorSerializer, PatientDoctorMappingSerializer, UserSerializer
from .premissions import IsAdmin, IsOwnerOrAdmin, IsCreatorOrAdmin
from .tasks import send_welcome_email
from django.contrib.auth import update_session_auth_hash


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            send_welcome_email.delay(user.email)
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'admin':
            patients = Patient.objects.all()
        else:
            patients = Patient.objects.filter(user=request.user)

        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.role != 'admin':
                serializer.save(user=request.user)
            else:
                serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientDetailView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_object(self, pk):
        try:
            patient = Patient.objects.get(pk=pk)
            self.check_object_permissions(self.request, patient)
            return patient
        except Patient.DoesNotExist:
            return None

    def get(self, request, pk):
        patient = self.get_object(pk)
        if not patient:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    def put(self, request, pk):
        patient = self.get_object(pk)
        if not patient:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PatientSerializer(patient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        patient = self.get_object(pk)
        if not patient:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
        patient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DoctorListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctors = Doctor.objects.all()  # this is the concept of ORM.
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'admin':
            return Response(
                {"error": "Only administrators can create doctors."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DoctorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Doctor.objects.get(pk=pk)
        except Doctor.DoesNotExist:
            return None

    def get(self, request, pk):
        doctor = self.get_object(pk)
        if not doctor:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)

    def put(self, request, pk):
        doctor = self.get_object(pk)
        if not doctor:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user.role != 'admin' and doctor.created_by != request.user:
            return Response(
                {"error": "You can only update doctors you created"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = DoctorSerializer(doctor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        doctor = self.get_object(pk)
        if not doctor:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user.role != 'admin' and doctor.created_by != request.user:
            return Response(
                {"error": "You can only delete doctors you created."},
                status=status.HTTP_403_FORBIDDEN
            )
        doctor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PatientDoctorMappingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'admin':
            mappings = PatientDoctorMapping.objects.all()
        else:
            mappings = PatientDoctorMapping.objects.filter(patient__user=request.user)
        serializer = PatientDoctorMappingSerializer(mappings, many=True)
        return Response(serializer.data)

    def post(self, request):
        print(f"User: {request.user}, Role: {request.user.role}")  # Debug
        print(f"Request data: {request.data}")  # Debug
        
        if request.user.role != 'admin':
            return Response(
                {"error": "Only administrators can create patient-doctor mappings"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            serializer = PatientDoctorMappingSerializer(data=request.data)
            print(f"Serializer data: {serializer.initial_data}")  # Debug
            
            if serializer.is_valid():
                print("Serializer is valid")  # Debug
                instance = serializer.save()
                print(f"Instance created: {instance}")  # Debug
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print(f"Serializer errors: {serializer.errors}")  # Debug
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Exception occurred: {str(e)}")  # Debug
            return Response(
                {"error": f"Server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PatientDoctorMappingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            mapping = PatientDoctorMapping.objects.get(pk=pk)
            if self.request.user.role != 'admin' and mapping.patient.user != self.request.user:
                raise PermissionDenied("You don't have permission to access this mapping")
            return mapping
        except PatientDoctorMapping.DoesNotExist:
            return None

    def get(self, request, pk):
        mapping = self.get_object(pk)
        if not mapping:
            return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PatientDoctorMappingSerializer(mapping)
        return Response(serializer.data)

    def delete(self, request, pk):
        mapping = self.get_object(pk)
        if not mapping:
            return Response({"error": "mapping not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'admin':
            return Response(
                {"error": "Only administrators can delete mappings"},
                status=status.HTTP_403_FORBIDDEN
            )

        mapping.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PatientDoctorByPatientView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):
        try:
            patient = Patient.objects.get(pk=patient_id)
            if request.user.role != 'admin' and patient.user != request.user:
                return Response(
                    {"error": "You can only view mappings for your own patients"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            mappings = PatientDoctorMapping.objects.filder(patient_id=patient_id)
            serializer = PatientDoctorMappingSerializer(mappings, many=True)
            return Response(serializer.data)

        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)


class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_object(self, pk):
        try:
            return CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return None
    
    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response(
                {"error": "Current password and new password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check current password
        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        user.set_password(new_password)
        user.save()

        # Update session auth hash to keep user logged in
        update_session_auth_hash(request, user)

        return Response(
            {"message": "Password changed successfully"},
            status=status.HTTP_200_OK
        )


class SystemSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        # Return default system settings
        # In a real application, you'd store these in the database
        default_settings = {
            'auto_logout': True,
            'session_timeout': 60,
            'email_notifications': True,
            'data_retention': 365,
            'max_login_attempts': 5,
            'password_min_length': 8
        }
        return Response(default_settings)

    def put(self, request):
        # Update system settings
        # In a real application, you'd save these to the database
        allowed_settings = [
            'auto_logout', 'session_timeout', 'email_notifications', 
            'data_retention', 'max_login_attempts', 'password_min_length'
        ]
        
        updated_settings = {}
        for setting in allowed_settings:
            if setting in request.data:
                updated_settings[setting] = request.data[setting]

        # Here you would typically save to database
        # For now, we'll just return the updated settings
        return Response({
            "message": "System settings updated successfully",
            "settings": updated_settings
        }, status=status.HTTP_200_OK)


class UserActivityView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        # Get recent user activity
        from django.db.models import Q
        from datetime import datetime, timedelta
        
        # Get activities from last 7 days
        week_ago = datetime.now() - timedelta(days=7)
        
        # You can extend this to track user activities in a separate model
        # For now, return basic user login information
        recent_users = CustomUser.objects.filter(
            Q(last_login__gte=week_ago) | Q(date_joined__gte=week_ago)
        ).order_by('-last_login', '-date_joined')[:10]
        
        activities = []
        for user in recent_users:
            activity = {
                'user_id': user.id,
                'username': user.username,
                'activity': 'Logged in' if user.last_login else 'Registered',
                'timestamp': user.last_login or user.date_joined,
                'type': 'login' if user.last_login else 'registration'
            }
            activities.append(activity)
        
        return Response(activities, status=status.HTTP_200_OK)
