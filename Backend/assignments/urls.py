from django.urls import path
from . import views

app_name = 'assignments'

urlpatterns = [
    path('', views.assignment_list, name='assignment_list'),
    path('create/', views.assignment_create, name='assignment_create'),
    path('<int:pk>/', views.assignment_detail, name='assignment_detail'),
    path('<int:pk>/edit/', views.assignment_edit, name='assignment_edit'),
    path('<int:pk>/delete/', views.assignment_delete, name='assignment_delete'),
    path('<int:pk>/milestones/', views.milestone_list, name='milestone_list'),
    path('<int:pk>/milestones/create/', views.milestone_create, name='milestone_create'),
    path('student/<int:student_id>/', views.student_assignments, name='student_assignments'),
    path('project/<int:project_id>/', views.project_assignments, name='project_assignments'),
] 