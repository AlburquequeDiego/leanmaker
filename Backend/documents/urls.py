"""
URLs para la app documents.
"""

from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    path('', views.document_list, name='document_list'),
    path('<int:document_id>/', views.document_detail, name='document_detail'),
]
