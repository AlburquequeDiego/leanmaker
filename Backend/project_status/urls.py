"""
URLs para la app project_status.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.project_status_list, name='project_status_list'),
    path('<str:project_status_id>/', views.project_status_detail, name='project_status_detail'),
    path('create/', views.project_status_create, name='project_status_create'),
    path('<str:project_status_id>/update/', views.project_status_update, name='project_status_update'),
    path('<str:project_status_id>/delete/', views.project_status_delete, name='project_status_delete'),
]
