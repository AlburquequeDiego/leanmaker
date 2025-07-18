"""
URLs para la app companies.
"""

from django.urls import path
from . import views

app_name = 'companies'

urlpatterns = [
    path('', views.company_list, name='company_list'),
    path('<uuid:companies_id>/', views.companies_detail, name='company_detail'),  # GET detalle
    path('<uuid:companies_id>/update/', views.companies_update, name='company_update'),  # PATCH/PUT actualización
    path('admin/<uuid:company_id>/suspend/', views.admin_suspend_company, name='admin_suspend_company'),
    path('admin/<uuid:company_id>/activate/', views.admin_activate_company, name='admin_activate_company'),
    path('admin/<uuid:company_id>/block/', views.admin_block_company, name='admin_block_company'),
    path('company_me/', views.company_me, name='company_me'),
] 