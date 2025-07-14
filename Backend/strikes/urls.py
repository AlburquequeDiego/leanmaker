"""
URLs para la app strikes.
"""

from django.urls import path
from . import views

app_name = 'strikes'

urlpatterns = [
    path('', views.strike_list, name='strike_list'),
    path('<int:strike_id>/', views.strike_detail, name='strike_detail'),
]
