"""
URLs para la app admin.
"""

from django.urls import path
from . import views

app_name = 'custom_admin'

urlpatterns = [
    # Dashboard principal
    path('dashboard/', views.admin_dashboard, name='dashboard'),
    
    # Gestión de estudiantes
    path('students/', views.student_list, name='student_list'),
    path('students/<int:student_id>/', views.student_detail, name='student_detail'),
    
    # Gestión de empresas
    path('companies/', views.company_list, name='company_list'),
    path('companies/<int:company_id>/', views.company_detail, name='company_detail'),
    
    # Gestión de proyectos
    path('projects/', views.project_list, name='project_list'),
    path('projects/<int:project_id>/', views.project_detail, name='project_detail'),
    
    # Gestión de usuarios
    path('users/', views.user_list, name='user_list'),
    path('users/<int:user_id>/', views.user_detail, name='user_detail'),
    
    # Gestión de horas trabajadas
    path('work-hours/', views.work_hours_list, name='work_hours_list'),
    path('work-hours/<int:work_hours_id>/', views.work_hours_detail, name='work_hours_detail'),
    
    # Gestión de evaluaciones
    path('evaluations/', views.evaluation_list, name='evaluation_list'),
    path('evaluations/<int:evaluation_id>/', views.evaluation_detail, name='evaluation_detail'),
    
    # Gestión de notificaciones
    path('notifications/', views.notification_list, name='notification_list'),
    path('notifications/<int:notification_id>/', views.notification_detail, name='notification_detail'),
] 