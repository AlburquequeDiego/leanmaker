"""
URLs para la app admin.
"""

from django.urls import path
from . import views

app_name = 'custom_admin'

urlpatterns = [
    # Dashboard principal
    # path('dashboard/', views.admin_dashboard, name='dashboard'),
    
    # Gestión de estudiantes
    # path('students/', views.student_list, name='student_list'),
    # path('students/<int:student_id>/', views.student_detail, name='student_detail'),
    
    # Gestión de empresas
    path('companies/', views.admin_companies_list, name='admin_companies_list'),
    path('companies/<uuid:company_id>/suspend/', views.admin_suspend_company, name='admin_suspend_company'),
    path('companies/<uuid:company_id>/block/', views.admin_block_company, name='admin_block_company'),
    path('companies/<uuid:company_id>/activate/', views.admin_activate_company, name='admin_activate_company'),
    # path('companies/<int:company_id>/', views.company_detail, name='company_detail'),
    
    # Gestión de proyectos
    path('projects/', views.admin_projects_list, name='admin_projects_list'),
    path('projects/<uuid:project_id>/suspend/', views.admin_suspend_project, name='admin_suspend_project'),
    path('projects/<uuid:project_id>/delete/', views.admin_delete_project, name='admin_delete_project'),
    # path('projects/<int:project_id>/', views.project_detail, name='project_detail'),
    
    # Gestión de usuarios
    # path('users/', views.user_list, name='user_list'),
    # path('users/<int:user_id>/', views.user_detail, name='user_detail'),
    
    # Gestión de horas trabajadas
    path('work-hours/', views.admin_work_hours_list, name='admin_work_hours_list'),
    # path('work-hours/<int:work_hours_id>/', views.work_hours_detail, name='work_hours_detail'),
    path('work-hours/<uuid:work_hour_id>/approve/', views.approve_work_hour, name='approve_work_hour'),
    
    # Gestión de evaluaciones
    # path('evaluations/', views.evaluation_list, name='evaluation_list'),
    # path('evaluations/<int:evaluation_id>/', views.evaluation_detail, name='evaluation_detail'),
    
    # Gestión de notificaciones
    # path('notifications/', views.notification_list, name='notification_list'),
    # path('notifications/<int:notification_id>/', views.notification_detail, name='notification_detail'),
] 