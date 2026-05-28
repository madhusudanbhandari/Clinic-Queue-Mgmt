from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
# Create your models here.


class Department(models.Model):
    name=models.CharField(max_length=100)
    code=models.CharField(max_length=10, unique=True)
    description=models.TextField(max_length=100,  blank=True)
    is_active=models.BooleanField(default=True)


    class Meta:
        ordering=['name']

    def __str__(self):
        return f"{self.code}-{self.name}"
    

class Doctor(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    department=models.ForeignKey(Department,on_delete=models.SET_NULL, null=True,related_name='doctors')
    phone=models.CharField(max_length=15)
    qualification=models.CharField(max_length=200)
    nmc_number=models.CharField(max_length=20,unique=True)
    consultation_fees=models.DecimalField(max_digits=8, decimal_places=2,default=500)
    available_days=models.CharField(
        max_length=100,
        default="Mon, Tue, Wed, Thu, Fri",
        help_text="e.g., Mon,Tue,Wed,Thu,Fri,Sat"
    )
    start_time=models.TimeField(default="09:00")
    end_time=models.TimeField(default="17:00")
    max_patients_per_day=models.IntegerField(default=30)
    is_available=models.BooleanField(default=True)

    class Meta:
        ordering=['user__first_name']

    def __str__(self):
        return f"Dr. {self.user.get_full_name()}({self.department})"
    
    @property
    def full_name(self):
        return f"Dr. {self.user.get_full_name()}"
    


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('booked',    '📋 Booked'),      
        ('called',    '📢 Called'),   
        ('serving',   '🩺 Serving'),     
        ('served',    '✅ Served'),      
        ('no_show',   '❌ No Show'),     
        ('cancelled', '🚫 Cancelled'),  
    ]
    
    GENDER_CHOICES=[('M','Male'),('F','Female'),('O','Other')]

    patient_name    = models.CharField(max_length=200)
    patient_phone   = models.CharField(max_length=15)
    patient_age     = models.IntegerField(null=True, blank=True)
    patient_gender  = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    patient_address = models.CharField(max_length=300, blank=True)  
    chief_complaint = models.TextField(blank=True)

    doctor           = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField(null=True, blank=True) 

    token_number=models.IntegerField(null=True,blank=True)
    token_display=models.CharField(max_length=20,blank=True)
    
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='booked')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    called_at  = models.DateTimeField(null=True, blank=True) 
    served_at  = models.DateTimeField(null=True, blank=True) 
    doctor_notes = models.TextField(blank=True)

    class Meta:
        ordering=['appointment_date','token_number']

    def __str__(self):
        return f"{self.token_display}-{self.patient_name}({self.appointment_date})"
    

    def save(self,*args,**kwargs):
        if not self.token_number:
            existing_count=Appointment.objects.filter(
                doctor=self.doctor,
                appointment_date=self.appointment_date
            ).count()

            self.token_number=existing_count+1
            dept_code=self.doctor.department.code if self.doctor.department else "GEN"
            self.token_display=f"{dept_code}-{str(self.token_number).zfill(3)}"

        super().save(*args, **kwargs)


class QueueStatus(models.Model):
    department=models.OneToOneField(Department,on_delete=models.CASCADE,related_name='queue_status')
    current_token=models.IntegerField(default=0)
    last_called_token=models.IntegerField(default=0)
    date=models.DateField(default=timezone.localdate)
    is_open=models.BooleanField(default=True)


    def __str__(self):
        return f"{self.department.code}-Serving #{self.current_token}"
    

    def reset_for_today(self):
        self.current_token=0
        self.last_called_token=0
        self.date=timezone.localdate()
        self.save()