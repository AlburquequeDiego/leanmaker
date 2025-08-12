"""
URLs para la app notifications.
"""

from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # URLs específicas primero (sin parámetros)
    path('mark-read/', views.mark_multiple_as_read, name='mark_multiple_as_read'),
    path('mark-all-read/', views.mark_all_as_read, name='mark_all_as_read'),
    path('unread-count/', views.notification_stats, name='unread_count'),
    path('stats/', views.notification_stats, name='notification_stats'),
    path('create/', views.create_notification, name='create_notification'),
    path('create-system/', views.create_system_notification, name='create_system_notification'),
    path('send-company-message/', views.send_company_message, name='send_company_message'),
    path('test/', views.test_endpoint, name='test_endpoint'),
    path('test-no-auth/', views.test_endpoint_no_auth, name='test_endpoint_no_auth'),
    
    # URL general antes de las URLs con parámetros
    path('', views.notification_list, name='notification_list'),
    
    # URLs con parámetros al final
    path('<str:notification_id>/mark-read/', views.mark_as_read, name='mark_as_read'),
    path('<str:notification_id>/delete/', views.delete_notification, name='delete_notification'),
    path('<str:notification_id>/', views.notification_detail, name='notification_detail'),
] 
