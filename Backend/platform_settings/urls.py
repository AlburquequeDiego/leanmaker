from django.urls import path
from . import views

app_name = 'platform_settings'

urlpatterns = [
    path('', views.settings_list, name='settings_list'),
    path('create/', views.setting_create, name='setting_create'),
    path('<int:pk>/', views.setting_detail, name='setting_detail'),
    path('<int:pk>/edit/', views.setting_edit, name='setting_edit'),
    path('<int:pk>/delete/', views.setting_delete, name='setting_delete'),
] 