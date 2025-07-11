"""
URLs para la app data_backups.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.data_backups_list, name='data_backups_list'),
    path('<str:data_backups_id>/', views.data_backups_detail, name='data_backups_detail'),
    path('create/', views.data_backups_create, name='data_backups_create'),
    path('<str:data_backups_id>/update/', views.data_backups_update, name='data_backups_update'),
    path('<str:data_backups_id>/delete/', views.data_backups_delete, name='data_backups_delete'),
]
