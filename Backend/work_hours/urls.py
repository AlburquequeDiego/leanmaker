"""
URLs para la app work_hours.
"""

from django.urls import path
from . import views

app_name = 'work_hours'

urlpatterns = [
    path('', views.work_hours_list, name='work_hours_list'),
    path('<int:work_hours_id>/', views.work_hours_detail, name='work_hours_detail'),
]
