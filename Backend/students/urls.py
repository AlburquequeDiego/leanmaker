"""
URLs para la app students.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Vista de prueba
    path('test/', views.student_test, name='student_test'),
    path('me/', views.student_me, name='student_me'),
    
    # Lista de estudiantes
    path('', views.student_list, name='student_list'),
    
    # Detalle de estudiante
    path('<str:student_id>/', views.student_detail, name='student_detail'),
    
    # Crear estudiante
    path('create/', views.student_create, name='student_create'),
    
    # Actualizar estudiante
    path('<str:student_id>/update/', views.student_update, name='student_update'),
    
    # Eliminar estudiante
    path('<str:student_id>/delete/', views.student_delete, name='student_delete'),
    
    # Proyectos del estudiante
    path('<str:student_id>/projects/', views.student_projects, name='student_projects'),
    
    # Aplicaciones del estudiante
    path('<str:student_id>/applications/', views.student_applications, name='student_applications'),
] 