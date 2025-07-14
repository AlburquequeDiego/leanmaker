"""
URLs para la app trl_levels.
"""

from django.urls import path
from . import views

app_name = 'trl_levels'

urlpatterns = [
    path('', views.trl_levels_list, name='trl_levels_list'),
    path('<int:level_id>/', views.trl_levels_detail, name='trl_levels_detail'),
]
