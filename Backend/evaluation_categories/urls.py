"""
URLs para la app evaluation_categories.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Endpoints principales
    path('', views.evaluation_categories_list, name='evaluation_categories_list'),
    path('<str:category_id>/', views.evaluation_categories_detail, name='evaluation_categories_detail'),
    path('create/', views.evaluation_categories_create, name='evaluation_categories_create'),
    path('<str:category_id>/update/', views.evaluation_categories_update, name='evaluation_categories_update'),
    path('<str:category_id>/delete/', views.evaluation_categories_delete, name='evaluation_categories_delete'),
    
    # Endpoints adicionales
    path('active/', views.active_categories, name='active_categories'),
    path('<str:category_id>/toggle/', views.toggle_category_status, name='toggle_category_status'),
]
