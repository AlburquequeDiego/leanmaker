"""
URLs para la app notifications.
"""

from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.notification_list, name='notification_list'),
    path('<str:notification_id>/', views.notification_detail, name='notification_detail'),
    path('<str:notification_id>/mark-read/', views.mark_as_read, name='mark_as_read'),
    path('mark-read/', views.mark_multiple_as_read, name='mark_multiple_as_read'),
    path('unread-count/', views.unread_count, name='unread_count'),
    path('create/', views.create_notification, name='create_notification'),
    path('send-company-message/', views.send_company_message, name='send_company_message'),
    path('<str:notification_id>/delete/', views.delete_notification, name='delete_notification'),
] 
