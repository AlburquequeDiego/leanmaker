"""
URL configuration for LeanMaker Backend - Django Puro + TypeScript.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from .views import (
    home, health_check, 
    api_login, api_register, api_logout, api_user_profile,
    api_refresh_token, api_verify_token
)

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),

    # Health Check
    path('health/', health_check, name='health-check'),
    path('api/health-simple/', health_check, name='api-health'),

    # Home page
    path('', home, name='home'),

    # API endpoints para React + TypeScript
    path('api/token/', api_login, name='api_login'),
    path('api/token/refresh/', api_refresh_token, name='api_refresh_token'),
    path('api/token/verify/', api_verify_token, name='api_verify_token'),
    path('api/auth/register/', api_register, name='api_register'),
    path('api/auth/logout/', api_logout, name='api_logout'),
    path('api/users/profile/', api_user_profile, name='api_user_profile'),

    # API endpoints para todas las apps
    path('api/users/', include('users.urls')),
    path('api/students/', include('students.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/project-applications/', include('applications.urls')),
    path('api/areas/', include('areas.urls')),
    path('api/trl-levels/', include('trl_levels.urls')),
    path('api/project-status/', include('project_status.urls')),
    path('api/assignments/', include('assignments.urls')),
    path('api/evaluations/', include('evaluations.urls')),
    path('api/evaluation-categories/', include('evaluation_categories.urls')),
    path('api/ratings/', include('ratings.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/mass-notifications/', include('mass_notifications.urls')),
    path('api/calendar-events/', include('calendar_events.urls')),
    path('api/work-hours/', include('work_hours.urls')),
    path('api/strikes/', include('strikes.urls')),
    path('api/questionnaires/', include('questionnaires.urls')),
    path('api/interviews/', include('interviews.urls')),
    path('api/platform-settings/', include('platform_settings.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/disciplinary-records/', include('disciplinary_records.urls')),
    path('api/activity-logs/', include('activity_logs.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/data-backups/', include('data_backups.urls')),

    # Dashboard routes (para compatibilidad con frontend)
    path('dashboard/', TemplateView.as_view(template_name='dashboard/index.html'), name='dashboard'),
    path('dashboard/student/', TemplateView.as_view(template_name='dashboard/student/index.html'), name='student-dashboard'),
    path('dashboard/company/', TemplateView.as_view(template_name='dashboard/company/index.html'), name='company-dashboard'),
    path('dashboard/admin/', TemplateView.as_view(template_name='dashboard/admin/index.html'), name='admin-dashboard'),
]

# Debug toolbar URLs (solo en desarrollo)
if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 