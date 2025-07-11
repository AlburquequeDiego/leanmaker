"""
URLs para la app evaluations.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Endpoints principales de evaluaciones
    path('', views.evaluations_list, name='evaluations_list'),
    path('<str:evaluation_id>/', views.evaluations_detail, name='evaluations_detail'),
    path('create/', views.evaluations_create, name='evaluations_create'),
    path('<str:evaluation_id>/update/', views.evaluations_update, name='evaluations_update'),
    path('<str:evaluation_id>/delete/', views.evaluations_delete, name='evaluations_delete'),
    
    # Endpoints de plantillas
    path('templates/', views.evaluation_templates_list, name='evaluation_templates_list'),
    path('templates/create/', views.evaluation_templates_create, name='evaluation_templates_create'),
    
    # Endpoints de habilidades de estudiantes
    path('skills/', views.student_skills_list, name='student_skills_list'),
    path('skills/create/', views.student_skills_create, name='student_skills_create'),
]
