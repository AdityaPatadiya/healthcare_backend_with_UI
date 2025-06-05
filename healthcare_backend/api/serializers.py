from rest_framework import serializers
from .models import Patient, Doctor, PatioendDoctorMapping
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        models = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'


class MappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatioendDoctorMapping
        fields = '__all__'
