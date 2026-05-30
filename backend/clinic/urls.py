from django.contrib import admin
from django.urls import path,include
from .import views


urlpatterns=[
    path('departments/',views.department_list, name='department-list'),
    path('doctors/', views.doctor_list,name='doctor-list'),
    path('appointments/', views.book_appointment, name='book-appointment'),
    path('appointments/list/', views.appointment_list, name='appointment-list'),
    path('appointments/check/<str:phone>/', views.check_appointment_by_phone, name='check-appointment'),
    path('appointments/<int:pk>/update-status/', views.update_appointment_status, name='update-status'),
    path('queue-status/', views.queue_status_list, name='queue-status'),
    path('queue/call-next/', views.call_next_patient, name='call-next'),
    path('stats/', views.today_stats, name='today-stats'),
    path('login/', views.staff_login, name='staff-login'),
    path('logout/', views.staff_logout, name='staff-logout'),
    path('me/', views.get_current_user, name='current-user'),
    path('register/', views.register_user, name='register'),
]