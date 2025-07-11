"""
URLs para la app disciplinary_records.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.disciplinary_records_list, name='disciplinary_records_list'),
    path('<str:disciplinary_records_id>/', views.disciplinary_records_detail, name='disciplinary_records_detail'),
    path('create/', views.disciplinary_records_create, name='disciplinary_records_create'),
    path('<str:disciplinary_records_id>/update/', views.disciplinary_records_update, name='disciplinary_records_update'),
    path('<str:disciplinary_records_id>/delete/', views.disciplinary_records_delete, name='disciplinary_records_delete'),
]
