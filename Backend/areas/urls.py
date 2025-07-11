"""
URLs para la app areas.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.areas_list, name='areas_list'),
    path('<str:areas_id>/', views.areas_detail, name='areas_detail'),
    path('create/', views.areas_create, name='areas_create'),
    path('<str:areas_id>/update/', views.areas_update, name='areas_update'),
    path('<str:areas_id>/delete/', views.areas_delete, name='areas_delete'),
]
