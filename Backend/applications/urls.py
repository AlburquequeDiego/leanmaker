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
    # Endpoints para empresas
    path('company/', views.company_applications_list, name='company_applications_list'),
    path('<uuid:application_id>/accept/', views.accept_application, name='accept_application'),
    path('<uuid:application_id>/reject/', views.reject_application, name='reject_application'),
]
