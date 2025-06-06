from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Patient, Doctor
from .serializers import PatientSerializer, RegisterSerializer, DoctorSerializer


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patients = Patient.objects.filter(user=request.user)
        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Patient.objects.get(pk=pk, user=user)
        except Patient.DoesNotExist:
            return None

    def get(self, request, pk):
        patient = self.get_object(pk, request.user)
        if not patient:
            return Response({"error": "Not Found"}, status=404)
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    def put(self, request, pk):
        patient = self. get_object(pk, request.user)
        if not patient:
            return Response({"error": "Not Found"}, status=404)
        serializer = PatientSerializer(patient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        patient = self.get_object(pk, request.user)
        if not patient:
            return Response({"error": "Not Found"}, status=404)
        patient.delete()
        return Response(status=204)


class DoctorListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = Doctor.objects.all()
        serializer = DoctorSerializer(doctor, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
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
            return Response({"error": "Not Found"}, status=404)
        serailizer = DoctorSerializer(doctor)
        if serailizer.is_valid():
            serailizer.save()
            return Response(serailizer.data)
        return Response(serailizer.errors, status=400)
    
    def delete(self,request, pk):
        doctor = self.get_object(pk)
        if not doctor:
            return Response({"error": "Not found"}, status=404)
        doctor.delete()
        return Response(status=204)
