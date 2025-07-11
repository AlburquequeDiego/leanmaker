"""
URLs for users app - Django Puro + TypeScript.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Authentication views
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('register/', views.user_register, name='register'),
    
    # User profile views
    path('profile/', views.user_profile, name='user_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('list/', views.user_list, name='user_list'),
    path('<int:user_id>/', views.user_detail, name='user_detail'),
    
    # API endpoints para TypeScript (simples)
    path('api/data/', views.api_user_data, name='api_user_data'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/register/', views.api_register, name='api_register'),
] 