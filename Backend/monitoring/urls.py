from django.urls import path
from . import views

app_name = 'monitoring'

urlpatterns = [
    path('', views.monitoring_list, name='monitoring_list'),
    path('create/', views.monitoring_create, name='monitoring_create'),
    path('<int:pk>/', views.monitoring_detail, name='monitoring_detail'),
]
