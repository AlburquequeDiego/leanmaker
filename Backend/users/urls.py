"""
URLs para la app users.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Lista de usuarios
    path('', views.user_list, name='user_list'),
    
    # Detalle de usuario
    path('<str:user_id>/', views.user_detail, name='user_detail'),
    
    # Crear usuario
    path('create/', views.user_create, name='user_create'),
    
    # Actualizar usuario
    path('<str:user_id>/update/', views.user_update, name='user_update'),
    
    # Eliminar usuario
    path('<str:user_id>/delete/', views.user_delete, name='user_delete'),
    
    # Cambiar contraseña
    path('change-password/', views.change_password, name='change_password'),
] 