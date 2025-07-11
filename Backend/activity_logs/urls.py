"""
URLs para la app activity_logs.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Lista de activity_logs
    path('', views.activity_logs_list, name='activity_logs_list'),
    
    # Detalle de activity_logs
    path('<str:activity_logs_id>/', views.activity_logs_detail, name='activity_logs_detail'),
    
    # Crear activity_logs
    path('create/', views.activity_logs_create, name='activity_logs_create'),
    
    # Actualizar activity_logs
    path('<str:activity_logs_id>/update/', views.activity_logs_update, name='activity_logs_update'),
    
    # Eliminar activity_logs
    path('<str:activity_logs_id>/delete/', views.activity_logs_delete, name='activity_logs_delete'),
]
