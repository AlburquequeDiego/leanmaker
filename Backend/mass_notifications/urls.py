"""
URLs para la app mass_notifications.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Endpoints principales de notificaciones masivas
    path('', views.mass_notifications_list, name='mass_notifications_list'),
    path('<str:notification_id>/', views.mass_notifications_detail, name='mass_notifications_detail'),
    path('create/', views.mass_notifications_create, name='mass_notifications_create'),
    path('<str:notification_id>/update/', views.mass_notifications_update, name='mass_notifications_update'),
    path('<str:notification_id>/delete/', views.mass_notifications_delete, name='mass_notifications_delete'),
    
    # Endpoints de acciones específicas
    path('<str:notification_id>/send/', views.send_notification, name='send_notification'),
    path('<str:notification_id>/schedule/', views.schedule_notification, name='schedule_notification'),
    
    # Endpoints de plantillas
    path('templates/', views.notification_templates_list, name='notification_templates_list'),
    path('templates/create/', views.notification_templates_create, name='notification_templates_create'),
]
