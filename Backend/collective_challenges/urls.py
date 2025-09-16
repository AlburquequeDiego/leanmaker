"""
🎯 URLs PARA DESAFÍOS COLECTIVOS

Este archivo define las rutas específicas para los endpoints de desafíos colectivos.
"""

from django.urls import path
from . import views
from . import views_ranking

app_name = 'collective_challenges'

urlpatterns = [
    # Endpoints públicos
    path('challenges/', views.api_challenges_list, name='api_challenges_list'),
    path('challenges/<uuid:challenge_id>/', views.api_challenge_detail, name='api_challenge_detail'),
    
    # Endpoints para empresas
    path('company/challenges/', views.api_company_challenges, name='api_company_challenges'),
    path('company/challenges/create/', views.api_challenge_create, name='api_challenge_create'),
    path('company/challenges/<uuid:challenge_id>/update/', views.api_challenge_update, name='api_challenge_update'),
    path('company/challenges/<uuid:challenge_id>/delete/', views.api_challenge_delete, name='api_challenge_delete'),
    
    # Endpoints para rankings y estadísticas
    path('ranking/', views_ranking.api_collective_challenges_ranking, name='api_collective_challenges_ranking'),
    path('teachers-ranking/', views_ranking.api_teachers_ranking, name='api_teachers_ranking'),
]
