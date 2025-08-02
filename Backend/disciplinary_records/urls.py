from django.urls import path
from . import views

app_name = 'disciplinary_records'

urlpatterns = [
    path('', views.disciplinary_records_list, name='disciplinary_records_list'),
    path('create/', views.disciplinary_records_create, name='disciplinary_records_create'),
    path('<int:pk>/', views.disciplinary_records_detail, name='disciplinary_records_detail'),
]
