from rest_framework import serializers
from .models import Patient, Doctor, PatientDoctorMapping, CustomUser
from django.contrib.auth.password_validation import validate_password
import uuid


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'full_name', 'is_active']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'password2', 'full_name', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        password2 = validated_data.pop('password2')
        role = validated_data.pop('role', 'user')

        # Split full name into first and last name
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Generate username from email
        username = validated_data['email'].split('@')[0]
        # Ensure username is unique
        base_username = username
        counter = 1
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = CustomUser.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            role=role,
            **validated_data
        )
        return user


class PatientSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'user_details', 'full_name', 'email', 'age', 
            'gender', 'contact_number', 'medical_history', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']
    
    def validate_age(self, value):
        if value <= 0 or value > 150:
            raise serializers.ValidationError("Age must be between 1 and 150")
        return value

    def validate_gender(self, value):
        valid_genders = ['Male', 'Female', 'Other']
        if value not in valid_genders:
            raise serializers.ValidationError(f"Gender must be one of: {', '.join(valid_genders)}")
        return value

    def validate_contact_number(self, value):
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError("Contact number must contain only digits and be at least 10 characters long")
        return value


class DoctorSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    is_approved = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'full_name', 'email', 'specializations', 'license_number',
            'years_of_experience', 'contact_number', 'is_approved', 
            'created_by', 'created_by_details', 'created_at'
        ]
        read_only_fields = ['created_by', 'is_approved', 'created_at']
    
    def validate_contact_number(self, value):
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError("Contact number must contain only digits and be at least 10 characters long")
        return value

    def validate_years_of_experience(self, value):
        if value < 0 or value > 60:
            raise serializers.ValidationError("Years of experience must be between 0 and 60")
        return value

    def validate_license_number(self, value):
        if Doctor.objects.filter(license_number=value).exists():
            raise serializers.ValidationError("License number already exists.")
        return value


class PatientDoctorMappingSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    doctor_specializations = serializers.ListField(source='doctor.specializations', read_only=True)

    class Meta:
        model = PatientDoctorMapping
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name', 
            'doctor_specializations', 'created_at'
        ]
        read_only_fields = ['created_at']

    def validate(self, data):
        if PatientDoctorMapping.objects.filter(patient=data['patient'], doctor=data['doctor']).exists():
            raise serializers.ValidationError("This patient-doctor mapping already exists.")
        return data