from rest_framework import serializers
from .models import Patient, Doctor, PatientDoctorMapping, CustomUser
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['role']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def validate_username(self,value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self,value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user


class PatientSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    class Meta:
        model = Patient
        fields = ['id', 'user', 'user_details', 'name', 'age', 'gender', 'address', 'condition', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def validate_age(self, value):
        if value <= 0 or value > 150:
            raise serializers.ValidationError("Age must be between 1 and 150")
        return value

    def validate_gender(self, value):
        valid_genders = ['Male', 'Female', "Other"]
        if value not in valid_genders:
            raise serializers.ValidationError(f"Gender must be one of: {', '}join{valid_genders}")
        return value


class DoctorSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialization', 'contact', 'email', 'created_by', 'created_by_details']
        read_only_fields = ['created_by']
    
    def validate_contact(self, value):
        if not value.isdigit() or len(value) < 10:
            raise serializers. ValidationError("Contact must contain only digits and be at least 10 characters long")
        return value


class PatientDoctorMappingSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)

    class Meta:
        model = PatientDoctorMapping
        fields = ['id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'doctor_specialization', 'created_at']
        read_only_fields = ['created_at']

    def validate(self,data):
        if PatientDoctorMapping.objects.filter(patient=data['patient'], doctor=data['doctor']).exists():
            raise serializers.ValidationError("This patient-doctor mapping already exists.")
        return data
