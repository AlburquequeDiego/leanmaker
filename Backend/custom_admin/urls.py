"""
URLs para la app custom_admin.
"""

from django.urls import path
from . import views

app_name = 'custom_admin'

urlpatterns = [
    path('', views.admin_companies_list, name='admin_companies_list'),
    path('companies/', views.admin_companies_list, name='admin_companies_list'),
    path('projects/', views.admin_projects_list, name='admin_projects_list'),
    path('evaluations/', views.admin_evaluations_list, name='admin_evaluations_list'),
]
