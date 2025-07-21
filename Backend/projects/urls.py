"""
URLs para la app projects.
"""

from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    path('', views.projects_list, name='projects_list'),
    path('create/', views.projects_create, name='projects_create'),
    path('<uuid:project_id>/', views.projects_update, name='projects_update'),
    path('<uuid:project_id>/detail/', views.projects_detail, name='projects_detail'),
    path('<uuid:project_id>/delete/', views.projects_delete, name='projects_delete'),
    path('<uuid:project_id>/restore/', views.projects_restore, name='projects_restore'),
    path('<uuid:project_id>/activate/', views.activate_project, name='activate_project'),
    path('my_projects/', views.my_projects, name='my_projects'),
    path('company_projects/', views.company_projects, name='company_projects'),
] 
