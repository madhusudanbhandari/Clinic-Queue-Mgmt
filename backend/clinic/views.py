from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Department, Doctor,Appointment,QueueStatus
from .serializers import DepartmentSerializer,DoctorListSerializer,AppointmentCreateSerializer,AppointmentSerializer,QueueStatusSerializer
# Create your views here.


@api_view(['GET'])
@permission_classes([AllowAny])
def department_list(request):
    departments=Department.objects.filter(is_active=True)
    serializer=DepartmentSerializer(departments,many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def doctor_list(request):
    doctors=Doctor.objects.filter(is_available=True).select_related('user','department')

    dept_id=request.query_params.get('department')
    if dept_id:
        doctors=doctors.filter(department_id=dept_id)

    serializer=DoctorListSerializer(doctors,many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def book_appointment(request):
    serializer=AppointmentCreateSerializer(data=request.data)
    if serializer.is_valid():
        appointment=serializer.save()
        response_serializer=AppointmentSerializer(appointment)
        return Response({
            'message':'Appointment booked successfully',
            'appointment':response_serializer.data
        },
        status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointment_list(request):
    appointments=Appointment.objects.select_related('doctor__user','doctor__department')

    date_filter=request.query_params.get('date',str(timezone.localdate()))
    doctor_filter=request.query_params.get('doctor')
    status_filter=request.query_params.get('status')
    dept_filter=request.query_params.get('department')


    appointments=appointments.filter(appointment_date=date_filter)

    if doctor_filter:
        appointments=appointments.filter(doctor_id=doctor_filter)

    if status_filter:
        appointments=appointments.filter(status=status_filter)

    if dept_filter:
        appointments=appointments.filter(doctor__department_id=dept_filter)

    if hasattr(request.user,'doctor_profile'):
        appointments=appointments.filter(doctor=request.user.doctor_profile)

    serializer=AppointmentSerializer(appointments,many=True)
    return Response(serializer.data)