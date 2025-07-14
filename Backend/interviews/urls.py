"""
URLs para la app interviews.
"""

from django.urls import path
from . import views

app_name = 'interviews'

urlpatterns = [
    path('', views.interview_list, name='interview_list'),
    path('<int:interview_id>/', views.interview_detail, name='interview_detail'),
]
