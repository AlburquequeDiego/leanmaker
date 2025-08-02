from django.urls import path
from . import views

app_name = 'activity_logs'

urlpatterns = [
    path('', views.activity_logs_list, name='activity_logs_list'),
    path('create/', views.activity_logs_create, name='activity_logs_create'),
    path('<int:pk>/', views.activity_logs_detail, name='activity_logs_detail'),
]
