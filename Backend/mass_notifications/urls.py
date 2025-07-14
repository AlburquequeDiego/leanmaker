"""
URLs para la app mass_notifications.
"""

from django.urls import path
from . import views

app_name = 'mass_notifications'

urlpatterns = [
    path('', views.mass_notifications_list, name='mass_notifications_list'),
    path('<int:notification_id>/', views.mass_notifications_detail, name='mass_notifications_detail'),
]
