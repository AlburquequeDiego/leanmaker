"""
URLs para la app platform_settings.
"""

from django.urls import path
from . import views

app_name = 'platform_settings'

urlpatterns = [
    path('', views.platform_setting_list, name='platform_setting_list'),
    path('<int:setting_id>/', views.platform_setting_detail, name='platform_setting_detail'),
] 
