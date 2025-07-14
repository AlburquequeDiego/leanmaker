"""
URLs para la app areas.
"""

from django.urls import path
from . import views

app_name = 'areas'

urlpatterns = [
    path('', views.areas_list, name='areas_list'),
    path('<int:area_id>/', views.areas_detail, name='areas_detail'),
]
