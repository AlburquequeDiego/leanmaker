from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('', views.reports_list, name='reports_list'),
    path('create/', views.reports_create, name='reports_create'),
    path('<int:pk>/', views.reports_detail, name='reports_detail'),
]
