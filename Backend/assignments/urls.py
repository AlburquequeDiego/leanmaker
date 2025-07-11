"""
URLs para la app assignments.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.assignments_list, name='assignments_list'),
    path('<str:assignments_id>/', views.assignments_detail, name='assignments_detail'),
    path('create/', views.assignments_create, name='assignments_create'),
    path('<str:assignments_id>/update/', views.assignments_update, name='assignments_update'),
    path('<str:assignments_id>/delete/', views.assignments_delete, name='assignments_delete'),
]
