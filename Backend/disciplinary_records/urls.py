"""
URLs para la app disciplinary_records.
"""

from django.urls import path
from . import views

app_name = 'disciplinary_records'

urlpatterns = [
    path('', views.disciplinary_records_list, name='disciplinary_records_list'),
    path('<int:record_id>/', views.disciplinary_records_detail, name='disciplinary_records_detail'),
]
