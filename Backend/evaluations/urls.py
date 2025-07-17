"""
URLs para la app evaluations.
"""

from django.urls import path
from . import views

app_name = 'evaluations'

urlpatterns = [
    path('', views.evaluations_list, name='evaluation_list'),
    path('<uuid:evaluation_id>/', views.evaluation_detail, name='evaluation_detail'),
    path('<uuid:evaluation_id>/update/', views.evaluations_update, name='evaluation_update'),
    path('<uuid:evaluation_id>/approve/', views.evaluation_approve, name='evaluation_approve'),
    path('<uuid:evaluation_id>/reject/', views.evaluation_reject, name='evaluation_reject'),
]
