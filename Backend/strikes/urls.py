"""
URLs para la app strikes.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.strikes_list, name='strikes_list'),
    path('<str:strikes_id>/', views.strikes_detail, name='strikes_detail'),
    path('create/', views.strikes_create, name='strikes_create'),
    path('<str:strikes_id>/update/', views.strikes_update, name='strikes_update'),
    path('<str:strikes_id>/delete/', views.strikes_delete, name='strikes_delete'),
]
