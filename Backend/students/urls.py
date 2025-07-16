"""
URLs para la app students.
"""

from django.urls import path
from . import views

app_name = 'students'

urlpatterns = [
    path('', views.student_list, name='student_list'),
    path('me/', views.student_me, name='student_me'),
    path('<int:student_id>/', views.student_detail, name='student_detail'),
    path('api-level-request/', views.api_level_request_create, name='api_level_request_create'),
    path('api-level-requests/', views.api_level_request_list, name='api_level_request_list'),
    path('admin/api-level-requests/', views.api_level_request_admin_list, name='api_level_request_admin_list'),
    path('admin/api-level-request/<int:request_id>/action/', views.api_level_request_admin_action, name='api_level_request_admin_action'),
    path('admin/<uuid:student_id>/suspend/', views.admin_suspend_student, name='admin_suspend_student'),
    path('admin/<uuid:student_id>/activate/', views.admin_activate_student, name='admin_activate_student'),
    path('admin/<uuid:student_id>/block/', views.admin_block_student, name='admin_block_student'),
] 