from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from django.db.models import Q
from django.core.exceptions import PermissionDenied
from .models import Patient, Doctor, PatientDoctorMapping, CustomUser
from .serializers import PatientSerializer, RegisterSerializer, DoctorSerializer, PatientDoctorMappingSerializer, UserSerializer
from .premissions import IsAdmin, IsOwnerOrAdmin, IsCreatorOrAdmin
from django.contrib.auth import update_session_auth_hash


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint for Docker
    """
    return Response({"status": "healthy", "service": "healthcare_backend"}, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("=== REGISTRATION REQUEST DATA ===")
        print(f"Raw data: {request.data}")
        print("=================================")
        
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            print("Serializer is valid")
            role = request.data.get('role', 'user')
            print(f"Creating user with role: {role}")
            
            try:
                user = serializer.save()
                user.role = role
                
                # For doctors, set is_active to False until approved by admin
                if role == 'doctor':
                    user.is_active = False
                
                user.save()
                print(f"User created: {user.username}, role: {user.role}")

                # Create role-specific profile
                if role == 'patient':
                    patient = Patient.objects.create(
                        user=user,
                        full_name=request.data.get('full_name', f"{user.first_name} {user.last_name}"),
                        email=user.email,
                        age=request.data.get('age', 0),
                        gender=request.data.get('gender', 'Other'),
                        contact_number=request.data.get('contact_number', ''),
                        medical_history=request.data.get('medical_history', '')
                    )
                    print(f"Patient profile created: {patient}")
                    
                elif role == 'doctor':
                    doctor = Doctor.objects.create(
                        user=user,
                        full_name=request.data.get('full_name', f"{user.first_name} {user.last_name}"),
                        email=user.email,
                        specializations=request.data.get('specializations', []),
                        license_number=request.data.get('license_number', ''),
                        years_of_experience=request.data.get('years_of_experience', 0),
                        contact_number=request.data.get('contact_number', ''),
                        is_approved=False,
                        created_by=user
                    )
                    print(f"Doctor profile created: {doctor}")

                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                    'message': 'Registration successful. ' + 
                              ('Your account is pending admin approval.' if role == 'doctor' else '')
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                print(f"Error during user creation: {str(e)}")
                return Response(
                    {"error": f"User creation failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            print("=== SERIALIZER ERRORS ===")
            print(f"Errors: {serializer.errors}")
            print("=========================")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth import authenticate
        
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {"error": "Email and password are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = CustomUser.objects.get(email=email)
            user = authenticate(username=user.username, password=password)
            
            if user is not None:
                # Check if doctor is approved
                if user.role == 'doctor':
                    try:
                        doctor = Doctor.objects.get(user=user)
                        if not doctor.is_approved:
                            return Response(
                                {"error": "Your account is pending admin approval"},
                                status=status.HTTP_403_FORBIDDEN
                            )
                    except Doctor.DoesNotExist:
                        pass
                
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Invalid credentials"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = UserSerializer(request.user).data

        # Include role-specific data
        if request.user.role == 'patient':
            try:
                patient = Patient.objects.get(user=request.user)
                user_data['profile'] = PatientSerializer(patient).data
            except Patient.DoesNotExist:
                user_data['profile'] = None
        elif request.user.role == 'doctor':
            try:
                doctor = Doctor.objects.get(user=request.user)
                user_data['profile'] = DoctorSerializer(doctor).data
            except Doctor.DoesNotExist:
                user_data['profile'] = None
        else:
            user_data['profile'] = None

        return Response(user_data)


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
        if request.user.role == 'admin':
            doctors = Doctor.objects.all()
        else:
            # Only show approved doctors to non-admin users
            doctors = Doctor.objects.filter(is_approved=True)

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
            doctor = Doctor.objects.get(pk=pk)
            # Non-admin users can only see approved doctors
            if not doctor.is_approved and self.request.user.role != 'admin':
                return None
            return doctor
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


class DoctorApprovalView(APIView):
    """Admin endpoint to approve/reject doctors"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, doctor_id):
        try:
            doctor = Doctor.objects.get(id=doctor_id)
            is_approved = request.data.get('is_approved')
            
            if is_approved is None:
                return Response(
                    {"error": "is_approved field is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            doctor.is_approved = is_approved
            doctor.save()
            
            # Activate/deactivate user account
            if doctor.user:
                doctor.user.is_active = is_approved
                doctor.user.save()
            
            action = "approved" if is_approved else "rejected"
            return Response(
                {"message": f"Doctor {action} successfully"},
                status=status.HTTP_200_OK
            )
            
        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class PendingDoctorsView(APIView):
    """Get all pending doctor approvals"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        pending_doctors = Doctor.objects.filter(is_approved=False)
        serializer = DoctorSerializer(pending_doctors, many=True)
        return Response(serializer.data)


class PatientDoctorMappingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'admin':
            mappings = PatientDoctorMapping.objects.all()
        elif request.user.role == 'doctor':
            mappings = PatientDoctorMapping.objects.filter(doctor__user=request.user)
        else:
            mappings = PatientDoctorMapping.objects.filter(patient__user=request.user)
        
        serializer = PatientDoctorMappingSerializer(mappings, many=True)
        return Response(serializer.data)

    def post(self, request):
        print(f"User: {request.user}, Role: {request.user.role}")
        print(f"Request data: {request.data}")

        # Allow both admins and doctors to create mappings
        if request.user.role not in ['admin', 'doctor']:
            return Response(
                {"error": "Only administrators and doctors can create patient-doctor mappings"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            serializer = PatientDoctorMappingSerializer(data=request.data)
            print(f"Serializer data: {serializer.initial_data}")
            
            if serializer.is_valid():
                print("Serializer is valid")
                
                if request.user.role == 'doctor':
                    try:
                        doctor_profile = Doctor.objects.get(user=request.user)
                        serializer.validated_data['doctor'] = doctor_profile
                    except Doctor.DoesNotExist:
                        return Response(
                            {"error": "Doctor profile not found for current user"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                instance = serializer.save()
                print(f"Instance created: {instance}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Exception occurred: {str(e)}")
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


class DoctorSelfPatientsView(APIView):
    """Get all patients mapped to the current doctor"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'doctor':
            return Response(
                {"error": "Only doctors can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            doctor_profile = Doctor.objects.get(user=request.user)
            mappings = PatientDoctorMapping.objects.filter(doctor=doctor_profile)
            patients = [mapping.patient for mapping in mappings]
            
            serializer = PatientSerializer(patients, many=True)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class DoctorMapPatientView(APIView):
    """Allow doctors to map patients to themselves"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'doctor':
            return Response(
                {"error": "Only doctors can map patients to themselves"},
                status=status.HTTP_403_FORBIDDEN
            )

        patient_id = request.data.get('patient_id')
        if not patient_id:
            return Response(
                {"error": "patient_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get the doctor profile
            doctor_profile = Doctor.objects.get(user=request.user)
            
            # Get the patient
            patient = Patient.objects.get(id=patient_id)
            
            # Check if mapping already exists
            if PatientDoctorMapping.objects.filter(patient=patient, doctor=doctor_profile).exists():
                return Response(
                    {"error": "This patient is already mapped to you"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the mapping
            mapping = PatientDoctorMapping.objects.create(
                patient=patient,
                doctor=doctor_profile
            )
            
            serializer = PatientDoctorMappingSerializer(mapping)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Doctor.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )


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

            mappings = PatientDoctorMapping.objects.filter(patient_id=patient_id)
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
