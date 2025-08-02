from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    path('', views.documents_list, name='documents_list'),
    path('create/', views.documents_create, name='documents_create'),
    path('<int:pk>/', views.documents_detail, name='documents_detail'),
]
