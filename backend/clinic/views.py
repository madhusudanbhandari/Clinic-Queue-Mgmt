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

@api_view(['GET'])
@permission_classes([AllowAny])
def check_appointment_by_phone(request,phone):
    today=timezone.localdate()
    appointments=Appointment.objects.filter(
        patienr_phone=phone,
        appointment_date=today
    ).select_related('doctor__user','doctor__department')

    if not appointments.exists():
        return Response(
            {'message':'No appointment found for this phone number today'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer=AppointmentSerializer(appointments,many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request,pk):
    appointment=get_object_or_404(Appointment,pk=pk)
    new_status=request.data.get('status')

    valid_statuses=['booked','waiting','called','serving','served','no_show','cancelled']
    if new_status not in valid_statuses:
        return Response({'error':f'Invalid status. Choose from: {valid_statuses}'},status=400)
    

    if new_status=='called':
        appointment.called_at=timezone.now()

        if appointment.doctor.department:
            queue,_=QueueStatus.objects.get_or_create(department=appointment.doctor.department)
            queue.current_token=appointment.token_number
            queue.last_called_token=appointment.token_number
            queue.save()


        elif new_status=='served':
            appointment.served_at=timezone.now()

        appointment.status=new_status
        appointment.doctor_notes=request.data.get('doctor_notes',appointment.doctor_notes)
        appointment.save()

        serializer=AppointmentSerializer(appointment)
        return Response({'message':'Status Updated','appointment':serializer.data})
    

@api_view(['GET'])
@permission_classes([AllowAny])
def queue_status_list(request):
    today=timezone.localdate()
    statuses=QueueStatus.objects.filter(is_open=True).select_related('department')
    serializer=QueueStatusSerializer(statuses,many=True)


    data=serializer.data 
    for item in data:
        dept_id=item['department']
        waiting_count=Appointment.objects.filter(
            doctor__department_id=dept_id,
            appointment_date=today,
            status='waiting'
        ).count()
        item['waiting_count']=waiting_count

    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def call_next_patient(request):
    dept_id=request.data.get('department_id')
    if not dept_id:
        return Response({'error':'department_id is required'},status=400)
    
    today=timezone.localdate()


    next_appointment=Appointment.objects.filter(
        doctor__department_id=dept_id,
        appointment_date=today,
        status='waiting'
    ).order_by('token_number').first()

    if not next_appointment:
        return Response({'message':'No more patients waiting in this department'})
    
    next_appointment.status = 'called'
    next_appointment.called_at = timezone.now()
    next_appointment.save()

    queue, _ = QueueStatus.objects.get_or_create(department_id=dept_id)
    queue.current_token = next_appointment.token_number
    queue.last_called_token = next_appointment.token_number
    queue.save()

    return Response({
        'message': f'Called {next_appointment.token_display}',
        'appointment': AppointmentSerializer(next_appointment).data,
        'token_display': next_appointment.token_display,
        'patient_name': next_appointment.patient_name,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def today_stats(request):
    today=timezone.localdate()
    appointments=Appointment.objects.filter(appointment_date=today)

   
    return Response({
        'total_booked':  appointments.count(),
        'waiting':       appointments.filter(status='waiting').count(),
        'serving':       appointments.filter(status='serving').count(),
        'served':        appointments.filter(status='served').count(),
        'no_show':       appointments.filter(status='no_show').count(),
        'cancelled':     appointments.filter(status='cancelled').count(),
        'date':          str(today),
    })