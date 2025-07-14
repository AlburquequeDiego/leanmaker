"""
URLs para la app activity_logs.
"""

from django.urls import path
from . import views

app_name = 'activity_logs'

urlpatterns = [
    path('', views.activity_logs_list, name='activity_logs_list'),
    path('<int:log_id>/', views.activity_logs_detail, name='activity_logs_detail'),
]
