from django.urls import path
from . import views

app_name = 'ratings'

urlpatterns = [
    path('', views.rating_list, name='rating_list'),
    path('create/', views.rating_create, name='rating_create'),
    path('<int:pk>/', views.rating_detail, name='rating_detail'),
    path('<int:pk>/edit/', views.rating_edit, name='rating_edit'),
    path('<int:pk>/delete/', views.rating_delete, name='rating_delete'),
    path('student-company/', views.student_company_ratings, name='student_company_ratings'),
    path('company-student/', views.company_student_ratings, name='company_student_ratings'),
    path('project/', views.project_ratings, name='project_ratings'),
] 