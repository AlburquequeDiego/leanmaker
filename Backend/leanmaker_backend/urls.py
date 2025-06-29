"""leanmaker_backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including other URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import api_config, health_check, home

urlpatterns = [
    path('', home, name='home'),

    # Admin interface
    path('admin/', admin.site.urls),

    # API documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API Configuration
    path('api/health/', health_check, name='health-check'),
    path('api/config/', api_config, name='api-config'),

    # App-specific URLs
    path('api/users/', include('users.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/students/', include('students.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/evaluations/', include('evaluations.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/strikes/', include('strikes.urls')),
    path('api/questionnaires/', include('questionnaires.urls')),
    path('api/platform/', include('platform_settings.urls')),
    path('api/calendar/', include('calendar_events.urls')),
    path('api/work-hours/', include('work_hours.urls')),
    path('api/interviews/', include('interviews.urls')),
    path('api/areas/', include('areas.urls')),
    path('api/trl-levels/', include('trl_levels.urls')),
    path('api/project-status/', include('project_status.urls')),
    path('api/assignments/', include('assignments.urls')),
    path('api/evaluation-categories/', include('evaluation_categories.urls')),
    path('api/ratings/', include('ratings.urls')),
    path('api/mass-notifications/', include('mass_notifications.urls')),
    path('api/disciplinary-records/', include('disciplinary_records.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/activity-logs/', include('activity_logs.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/data-backups/', include('data_backups.urls')),

    # Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]

# Servir archivos de medios en modo de desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
