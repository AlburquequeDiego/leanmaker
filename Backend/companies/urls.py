"""
URLs para la app companies.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.companies_list, name='companies_list'),
    path('<str:companies_id>/', views.companies_detail, name='companies_detail'),
    path('create/', views.companies_create, name='companies_create'),
    path('<str:companies_id>/update/', views.companies_update, name='companies_update'),
    path('<str:companies_id>/delete/', views.companies_delete, name='companies_delete'),
] 