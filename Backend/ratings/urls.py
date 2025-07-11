"""
URLs para la app ratings.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Endpoints básicos CRUD
    path('', views.ratings_list, name='ratings_list'),
    path('<str:ratings_id>/', views.ratings_detail, name='ratings_detail'),
    path('create/', views.ratings_create, name='ratings_create'),
    path('<str:ratings_id>/update/', views.ratings_update, name='ratings_update'),
    path('<str:ratings_id>/delete/', views.ratings_delete, name='ratings_delete'),
    
    # Endpoints adicionales
    path('stats/', views.ratings_stats, name='ratings_stats'),
    path('user/', views.user_ratings, name='user_ratings'),
    path('project/<str:project_id>/', views.project_ratings, name='project_ratings'),
]
