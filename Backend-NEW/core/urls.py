"""
URL configuration for LeanMaker Backend - Django Puro + TypeScript.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from .views import home, health_check

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),

    # Health Check
    path('health/', health_check, name='health-check'),

    # Home page
    path('', home, name='home'),

    # Authentication
    path('auth/', include('users.urls')),

    # App-specific URLs
    path('users/', include('users.urls')),
    path('companies/', include('companies.urls')),
    path('students/', include('students.urls')),
    path('projects/', include('projects.urls')),
    path('applications/', include('applications.urls')),
    path('evaluations/', include('evaluations.urls')),
    path('notifications/', include('notifications.urls')),
    path('strikes/', include('strikes.urls')),
    path('questionnaires/', include('questionnaires.urls')),
    path('platform/', include('platform_settings.urls')),
    path('calendar/', include('calendar_events.urls')),
    path('work-hours/', include('work_hours.urls')),
    path('interviews/', include('interviews.urls')),
    path('areas/', include('areas.urls')),
    path('trl-levels/', include('trl_levels.urls')),
    path('project-status/', include('project_status.urls')),
    path('assignments/', include('assignments.urls')),
    path('evaluation-categories/', include('evaluation_categories.urls')),
    path('ratings/', include('ratings.urls')),
    path('mass-notifications/', include('mass_notifications.urls')),
    path('disciplinary-records/', include('disciplinary_records.urls')),
    path('documents/', include('documents.urls')),
    path('activity-logs/', include('activity_logs.urls')),
    path('reports/', include('reports.urls')),
    path('data-backups/', include('data_backups.urls')),

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