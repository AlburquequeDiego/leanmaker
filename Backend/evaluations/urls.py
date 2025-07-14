"""
URLs para la app evaluations.
"""

from django.urls import path
from . import views

app_name = 'evaluations'

urlpatterns = [
    path('', views.evaluation_list, name='evaluation_list'),
    path('<int:evaluation_id>/', views.evaluation_detail, name='evaluation_detail'),
]
