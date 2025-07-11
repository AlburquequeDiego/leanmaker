"""
URLs para la app documents.
"""

from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    # Endpoints principales
    path('', views.document_list_create, name='document-list-create'),
    path('<uuid:document_id>/', views.document_detail, name='document-detail'),
    
    # Endpoints adicionales
    path('<uuid:document_id>/download/', views.download_document, name='download-document'),
    path('stats/', views.document_stats, name='document-stats'),
]
