"""
URLs para la app evaluations.
"""

from django.urls import path
from . import views

app_name = 'evaluations'

urlpatterns = [
    path('', views.evaluations_list, name='evaluation_list'),
    path('create/', views.evaluations_create, name='evaluation_create'),
    path('by_project/<uuid:project_id>/', views.evaluations_by_project, name='evaluations_by_project'),
    path('<uuid:evaluation_id>/', views.evaluation_detail, name='evaluation_detail'),
    path('<uuid:evaluation_id>/update/', views.evaluations_update, name='evaluation_update'),
    path('<uuid:evaluation_id>/approve/', views.evaluation_approve, name='evaluation_approve'),
    path('<uuid:evaluation_id>/reject/', views.evaluation_reject, name='evaluation_reject'),
    
    # NUEVOS ENDPOINTS PARA EVALUACIONES MUTUAS
    path('company-evaluate-student/', views.company_evaluate_student, name='company_evaluate_student'),
    path('company-students-to-evaluate/', views.company_students_to_evaluate, name='company_students_to_evaluate'),
    path('company-completed-evaluations/', views.company_completed_evaluations, name='company_completed_evaluations'),
    
    # ENDPOINTS PARA ESTUDIANTES EVALUANDO EMPRESAS
    path('student-evaluate-company/', views.student_evaluate_company, name='student_evaluate_company'),
    path('student-companies-to-evaluate/', views.student_companies_to_evaluate, name='student_companies_to_evaluate'),
    path('student-completed-evaluations/', views.student_completed_evaluations, name='student_completed_evaluations'),
    
    # ENDPOINTS PARA ADMIN
    path('admin/management/', views.admin_evaluations_management, name='admin_evaluations_management'),
    path('admin/strikes-management/', views.admin_strikes_management, name='admin_strikes_management'),
]
