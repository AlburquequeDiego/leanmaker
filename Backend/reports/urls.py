"""
URLs para la app reports.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.reports_list, name='reports_list'),
    path('<str:reports_id>/', views.reports_detail, name='reports_detail'),
    path('create/', views.reports_create, name='reports_create'),
    path('<str:reports_id>/update/', views.reports_update, name='reports_update'),
    path('<str:reports_id>/delete/', views.reports_delete, name='reports_delete'),
]
