from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth.models import User
from .models import Department, Doctor, Appointment, QueueStatus


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Department
        fields=['id','name','code','description','is_active']


class DoctorListSerializer(serializers.ModelSerializer):
    full_name=serializers.CharField(source='user.get_full_name',read_only=True)
    department_name=serializers.CharField(source='department.name',read_only=True)
    department_code=serializers.CharField(source='department.code',read_only=True)


    class Meta:
        model=Doctor
        fields = [
            'id', 'full_name', 'department_name', 'department_code',
            'qualification', 'consultation_fees', 'available_days',
            'start_time', 'end_time', 'is_available', 'max_patients_per_day'
        ]


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model=Appointment
        fields = [
            'id', 'patient_name', 'patient_phone', 'patient_age',
            'patient_gender', 'patient_address', 'chief_complaint',
            'doctor', 'appointment_date', 'appointment_time',
            'token_number', 'token_display', 'status', 'created_at'
        ]
        read_only_fields=['token_number','token_display','status','created_at']


    def validate_appointment_date(self,value):
        if value<timezone.localdate():
            raise serializers.ValidationError("Appointment data cannot be past")
        return value
    
    def validate(self, data):
        doctor=data.get('doctor')
        date=data.get('appointment_date')
        if doctor and date:
            booked=Appointment.objects.filter(
                doctor=doctor,
                appointment_date=date,
                status__in=['booked','waiting','called','serving','served']
            ).count()
            if booked>= doctor.max_patients_per_day:
                raise serializers.ValidationError(
                    f"This doctor is fully booked on {date}. Please choose another datee"
                )
        return data
    

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name      = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    department_name  = serializers.CharField(source='doctor.department.name', read_only=True)
    department_code  = serializers.CharField(source='doctor.department.code', read_only=True)
    status_display   = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model=Appointment
        fields=[
           'id', 'patient_name', 'patient_phone', 'patient_age',
            'patient_gender', 'patient_address', 'chief_complaint',
            'doctor', 'doctor_name', 'department_name', 'department_code',
            'appointment_date', 'appointment_time',
            'token_number', 'token_display', 'status', 'status_display',
            'created_at', 'updated_at', 'called_at', 'served_at', 'doctor_notes'  
        ]
        read_only_fields=['token_number','token_display','doctor_notes']


class QueueStatusSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)



    class Meta:
        model = QueueStatus
        fields = [
            'id', 'department', 'department_name', 'department_code',
            'current_token', 'last_called_token', 'date', 'is_open'
        ]


class UserSerializer(serializers.ModelSerializer):
    role        = serializers.SerializerMethodField()
    doctor_info = serializers.SerializerMethodField()
    full_name   = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'email',
            'full_name',    # computed → get_full_name()
            'role',         # computed → get_role()
            'doctor_info',  # computed → get_doctor_info()
        ]

        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_full_name(self,obj):
        return obj.get_full_name() or obj.username
    
    def get_role(self,obj):
        if obj.is_superuser:
            return 'superadmin'
        if hasattr(obj, 'doctor_profile'):
            return 'doctor'
        return 'admin'

    def get_doctor_info(self,obj):
        if not hasattr (obj, 'doctor_profile'):
            return None
        
        doc=obj.doctor_profile
        return{
            'id':              doc.id,
            'department':      doc.department.name if doc.department else None,
            'department_id':   doc.department.id   if doc.department else None,
            'department_code': doc.department.code if doc.department else None,
            'qualification':   doc.qualification,
            'nmc_number':      doc.nmc_number,
            'consultation_fee':str(doc.consultation_fee),
            'is_available':    doc.is_available,
        }