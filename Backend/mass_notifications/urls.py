from django.urls import path
from . import views

app_name = 'mass_notifications'

urlpatterns = [
    path('', views.notification_list, name='notification_list'),
    path('create/', views.notification_create, name='notification_create'),
    path('<int:pk>/', views.notification_detail, name='notification_detail'),
    path('<int:pk>/send/', views.notification_send, name='notification_send'),
    path('templates/', views.template_list, name='template_list'),
    path('templates/create/', views.template_create, name='template_create'),
] 