from django.contrib import admin
from .models import Department, Doctor, Appointment, QueueStatus
from django.contrib.auth.models import User
# Register your models here.




class UserAdmin(admin.ModelAdmin):
    list_display=['username','email']

admin.site.unregister(User)
admin.site.register(User,UserAdmin)



@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display=['code','name','is_active']
    list_filter=['is_active']
    search_fields=['name','code']


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display=['full_name','department','phone','nmc_number','is_available']
    list_filter=['department','is_available']
    search_fields=['user__first.name','user__last_name','nmc_number']

    def full_name(self, obj):
        return obj.full_name
    

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'token_display', 'patient_name', 'patient_phone',
        'doctor', 'appointment_date', 'status', 'created_at'
    ]
    list_filter = ['status', 'appointment_date', 'doctor__department']
    search_fields = ['patient_name', 'patient_phone', 'token_display']
    readonly_fields = ['token_number', 'token_display', 'created_at', 'updated_at']
    list_editable=['status']

@admin.register(QueueStatus)
class QueueStatusAdmin(admin.ModelAdmin):
    list_display=['department','current_token','last_called_token','date','is_open']
    list_editable=['is_open']
