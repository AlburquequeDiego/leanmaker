"""
URLs para la app projects.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.projects_list, name='projects_list'),
    path('my_projects/', views.projects_my_projects, name='projects_my_projects'),
    path('<str:project_id>/', views.projects_detail, name='projects_detail'),
    path('create/', views.projects_create, name='projects_create'),
    path('<str:project_id>/update/', views.projects_update, name='projects_update'),
    path('<str:project_id>/delete/', views.projects_delete, name='projects_delete'),
] 
