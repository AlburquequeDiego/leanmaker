"""
URLs para la app companies.
"""

from django.urls import path
from . import views
from .views import company_ratings, student_completed_projects

app_name = 'companies'

urlpatterns = [
    path('', views.company_list, name='company_list'),
    path('admin/companies/', views.admin_companies_list, name='admin_companies_list'),  # Nueva URL para admin
    path('admin/companies-simple/', views.companies_list_admin, name='companies_list_admin'),  # Nueva URL simple
    path('test-simple/', views.test_simple_response, name='test_simple_response'),
    path('test-gpa/', views.test_gpa_calculation, name='test_gpa_calculation'),  # Endpoint de prueba
    path('<uuid:companies_id>/', views.companies_detail, name='company_detail'),  # GET detalle
    path('<uuid:companies_id>/update/', views.companies_update, name='company_update'),  # PATCH/PUT actualización
    path('admin/<uuid:company_id>/suspend/', views.admin_suspend_company, name='admin_suspend_company'),
    path('admin/<uuid:company_id>/activate/', views.admin_activate_company, name='admin_activate_company'),
    path('admin/<uuid:company_id>/block/', views.admin_block_company, name='admin_block_company'),
    path('company_me/', views.company_me, name='company_me'),
    # NUEVOS ENDPOINTS PARA CALIFICACIONES
    path('ratings/', company_ratings, name='company_ratings'),  # POST/GET calificaciones de empresas
    path('student/completed-projects/', student_completed_projects, name='student_completed_projects'),  # GET proyectos completados
] 