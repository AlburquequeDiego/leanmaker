"""
URLs para la app notifications.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Endpoints principales de notificaciones
    path('', views.notifications_list, name='notifications_list'),
    path('<str:notification_id>/', views.notifications_detail, name='notifications_detail'),
    path('create/', views.notifications_create, name='notifications_create'),
    path('<str:notification_id>/update/', views.notifications_update, name='notifications_update'),
    path('<str:notification_id>/delete/', views.notifications_delete, name='notifications_delete'),
    
    # Endpoints de acciones masivas
    path('mark-read/', views.mark_notifications_read, name='mark_notifications_read'),
    path('bulk-action/', views.bulk_notification_action, name='bulk_notification_action'),
    
    # Endpoints de plantillas
    path('templates/', views.notification_templates_list, name='notification_templates_list'),
    path('templates/create/', views.notification_templates_create, name='notification_templates_create'),
    
    # Endpoints de preferencias
    path('preferences/', views.notification_preferences_list, name='notification_preferences_list'),
    path('preferences/create/', views.notification_preferences_create, name='notification_preferences_create'),
] 
