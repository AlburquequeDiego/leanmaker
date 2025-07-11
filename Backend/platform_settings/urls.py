"""
URLs para la app platform_settings.
"""

from django.urls import path
from . import views

app_name = 'platform_settings'

urlpatterns = [
    # Endpoints principales
    path('', views.platform_setting_list_create, name='setting-list-create'),
    path('<uuid:setting_id>/', views.platform_setting_detail, name='setting-detail'),
    # Endpoint para obtener por clave
    path('key/<str:key>/', views.get_setting_by_key, name='get-setting-by-key'),
] 
