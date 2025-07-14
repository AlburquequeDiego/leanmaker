"""
URLs para la app applications.
"""

from django.urls import path
from . import views

app_name = 'applications'

urlpatterns = [
    path('', views.application_list, name='application_list'),
    path('<int:application_id>/', views.application_detail, name='application_detail'),
    path('my_applications/', views.my_applications, name='my_applications'),
]
