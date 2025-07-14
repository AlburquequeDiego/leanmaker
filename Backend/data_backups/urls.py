"""
URLs para la app data_backups.
"""

from django.urls import path
from . import views

app_name = 'data_backups'

urlpatterns = [
    path('', views.data_backups_list, name='data_backups_list'),
    path('<int:backup_id>/', views.data_backups_detail, name='data_backups_detail'),
]
