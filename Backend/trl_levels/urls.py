"""
URLs para la app trl_levels.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.trl_levels_list, name='trl_levels_list'),
    path('<str:trl_levels_id>/', views.trl_levels_detail, name='trl_levels_detail'),
    path('create/', views.trl_levels_create, name='trl_levels_create'),
    path('<str:trl_levels_id>/update/', views.trl_levels_update, name='trl_levels_update'),
    path('<str:trl_levels_id>/delete/', views.trl_levels_delete, name='trl_levels_delete'),
]
