"""
URLs para la app interviews.
"""

from django.urls import path
from . import views

app_name = 'interviews'

urlpatterns = [
    # Endpoints principales
    path('', views.interview_list_create, name='interview-list-create'),
    path('<uuid:interview_id>/', views.interview_detail, name='interview-detail'),
    
    # Endpoints de acciones específicas
    path('<uuid:interview_id>/complete/', views.complete_interview, name='complete-interview'),
    path('<uuid:interview_id>/cancel/', views.cancel_interview, name='cancel-interview'),
    path('<uuid:interview_id>/no-show/', views.mark_no_show, name='mark-no-show'),
    
    # Endpoints adicionales
    path('stats/', views.interview_stats, name='interview-stats'),
    path('upcoming/', views.upcoming_interviews, name='upcoming-interviews'),
]
