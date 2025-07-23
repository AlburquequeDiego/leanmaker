"""
URLs para la app projects.
"""

from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    path('', views.projects_list, name='projects_list'),
    path('create/', views.projects_create, name='projects_create'),
    path('<uuid:project_id>/', views.projects_detail, name='projects_detail'),  # GET para detalles
    path('<uuid:project_id>/update/', views.projects_update, name='projects_update'),  # PUT/PATCH para actualizar
    path('<uuid:project_id>/delete/', views.projects_delete, name='projects_delete'),
    path('<uuid:project_id>/restore/', views.projects_restore, name='projects_restore'),
    path('<uuid:project_id>/activate/', views.activate_project, name='activate_project'),
    path('<uuid:project_id>/participants/', views.project_participants, name='project_participants'),
    path('my_projects/', views.my_projects, name='my_projects'),
    path('company_projects/', views.company_projects, name='company_projects'),
    path('completed_pending_hours/', views.completed_pending_hours, name='completed_pending_hours'),
    path('<uuid:project_id>/validate_hours/', views.validate_project_hours, name='validate_project_hours'),
] 
