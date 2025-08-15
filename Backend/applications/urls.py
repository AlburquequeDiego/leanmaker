"""
URLs para la app applications.
"""

from django.urls import path
from . import views

app_name = 'applications'

urlpatterns = [
    path('', views.application_list, name='application_list'),
    path('<uuid:application_id>/', views.application_detail, name='application_detail'),
    path('my_applications/', views.my_applications, name='my_applications'),
    path('received_applications/', views.received_applications, name='received_applications'),
    # Endpoint para empresas - historial de estudiantes únicos
    path('company/students/', views.company_students_history, name='company_students_history'),
    # Endpoint de prueba para debug
    path('company/test/', views.test_company_endpoint, name='test_company_endpoint'),
    # Endpoint de debug para datos de estudiantes
    path('company/debug/', views.debug_company_students_data, name='debug_company_students_data'),
    path('<uuid:application_id>/accept/', views.accept_application, name='accept_application'),
    path('<uuid:application_id>/reject/', views.reject_application, name='reject_application'),
]
