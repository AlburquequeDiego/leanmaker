"""
URLs para la app assignments.
"""

from django.urls import path
from . import views

app_name = 'assignments'

urlpatterns = [
    path('', views.assignments_list, name='assignments_list'),
    path('<int:assignment_id>/', views.assignments_detail, name='assignments_detail'),
]
