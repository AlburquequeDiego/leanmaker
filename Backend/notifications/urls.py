"""
URLs para la app notifications.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Endpoints principales de notificaciones
    path('', views.notifications_list, name='notifications_list'),
    path('<str:notifications_id>/', views.notifications_detail, name='notifications_detail'),
    path('create/', views.notifications_create, name='notifications_create'),
    path('<str:notifications_id>/update/', views.notifications_update, name='notifications_update'),
    path('<str:notifications_id>/delete/', views.notifications_delete, name='notifications_delete'),
    
    # Endpoints de acciones
    path('<str:notifications_id>/mark-read/', views.notifications_mark_read, name='notifications_mark_read'),
    path('mark-all-read/', views.notifications_mark_all_read, name='notifications_mark_all_read'),
] 
