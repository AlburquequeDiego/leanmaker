"""
URLs para la app work_hours.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.work_hours_list, name='work_hours_list'),
    path('<str:work_hours_id>/', views.work_hours_detail, name='work_hours_detail'),
    path('create/', views.work_hours_create, name='work_hours_create'),
    path('<str:work_hours_id>/update/', views.work_hours_update, name='work_hours_update'),
    path('<str:work_hours_id>/delete/', views.work_hours_delete, name='work_hours_delete'),
]
