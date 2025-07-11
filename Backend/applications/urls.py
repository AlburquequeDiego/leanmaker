"""
URLs para la app applications.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.applications_list, name='applications_list'),
    path('<str:applications_id>/', views.applications_detail, name='applications_detail'),
    path('create/', views.applications_create, name='applications_create'),
    path('<str:applications_id>/update/', views.applications_update, name='applications_update'),
    path('<str:applications_id>/delete/', views.applications_delete, name='applications_delete'),
]
