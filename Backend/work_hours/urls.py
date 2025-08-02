from django.urls import path
from . import views

app_name = 'work_hours'

urlpatterns = [
    path('', views.work_hours_list, name='work_hours_list'),
    path('create/', views.work_hours_create, name='work_hours_create'),
    path('<int:pk>/', views.work_hours_detail, name='work_hours_detail'),
    path('<int:pk>/update/', views.work_hours_update, name='work_hours_update'),
    path('<int:pk>/delete/', views.work_hours_delete, name='work_hours_delete'),
    path('student/<int:student_id>/', views.student_work_hours, name='student_work_hours'),
    path('project/<int:project_id>/', views.project_work_hours, name='project_work_hours'),
] 