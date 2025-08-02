from django.urls import path
from . import views

app_name = 'data_backups'

urlpatterns = [
    path('', views.data_backups_list, name='data_backups_list'),
    path('create/', views.data_backups_create, name='data_backups_create'),
    path('<int:pk>/', views.data_backups_detail, name='data_backups_detail'),
]
