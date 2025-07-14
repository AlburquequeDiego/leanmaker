"""
URLs para la app project_status.
"""

from django.urls import path
from . import views

app_name = 'project_status'

urlpatterns = [
    path('', views.project_status_list, name='project_status_list'),
    path('<int:status_id>/', views.project_status_detail, name='project_status_detail'),
]
