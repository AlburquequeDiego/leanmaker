"""
URLs para la app users.
"""

from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('', views.user_list, name='user_list'),
    path('profile/', views.user_profile, name='user_profile'),
    path('<int:user_id>/', views.user_detail, name='user_detail'),
] 