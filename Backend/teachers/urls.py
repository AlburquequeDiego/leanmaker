"""
🎓 URLs PARA FUNCIONALIDADES DEL DOCENTE

Este archivo define las rutas específicas para las funcionalidades del docente.
"""

from django.urls import path
from . import views

app_name = 'teachers'

urlpatterns = [
    # Endpoints específicos del docente
    path('teacher/students/', views.api_teacher_students, name='api_teacher_students'),
    path('teacher/projects/', views.api_teacher_projects, name='api_teacher_projects'),
    path('teacher/evaluations/', views.api_teacher_evaluations, name='api_teacher_evaluations'),
    path('teacher/reports/', views.api_teacher_reports, name='api_teacher_reports'),
    path('teacher/schedule/', views.api_teacher_schedule, name='api_teacher_schedule'),
]
