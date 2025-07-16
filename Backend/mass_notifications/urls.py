"""
URLs para la app mass_notifications.
"""

from django.urls import path
from . import views

app_name = 'mass_notifications'

urlpatterns = [
    path('', views.mass_notifications_list, name='mass_notifications_list'),
    path('create/', views.mass_notifications_create, name='mass_notifications_create'),
    path('templates/', views.notification_templates_list, name='notification_templates_list'),
    path('templates/create/', views.notification_templates_create, name='notification_templates_create'),
    path('<str:notification_id>/', views.mass_notifications_detail, name='mass_notifications_detail'),
    path('<str:notification_id>/update/', views.mass_notifications_update, name='mass_notifications_update'),
    path('<str:notification_id>/delete/', views.mass_notifications_delete, name='mass_notifications_delete'),
    path('<str:notification_id>/send/', views.send_notification, name='send_notification'),
    path('<str:notification_id>/schedule/', views.schedule_notification, name='schedule_notification'),
]
