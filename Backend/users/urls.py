"""
URLs para la app users.
"""

from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('', views.user_list, name='user_list'),
    path('create/', views.user_create, name='user_create'),
    path('profile/', views.user_profile, name='user_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('<uuid:user_id>/', views.user_detail, name='user_detail'),
    path('<uuid:user_id>/suspend/', views.suspend_user, name='suspend_user'),
    path('<uuid:user_id>/activate/', views.activate_user, name='activate_user'),
    path('<uuid:user_id>/block/', views.block_user, name='block_user'),
    path('<uuid:user_id>/unblock/', views.unblock_user, name='unblock_user'),
] 