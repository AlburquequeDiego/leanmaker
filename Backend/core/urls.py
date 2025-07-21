"""
URL configuration for LeanMaker Backend.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

# Importar vistas personalizadas
from . import views

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Página principal
    path('', views.home, name='home'),
    
    # URLs de autenticación
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    
    # Dashboard principal
    path('dashboard/', views.dashboard, name='dashboard'),
    
    # URLs de las aplicaciones
    path('api/users/', include('users.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/students/', include('students.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/evaluations/', include('evaluations.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/calendar/events/', include('calendar_events.urls')),
    path('work-hours/', include('work_hours.urls')),
    path('interviews/', include('interviews.urls')),
    #path('calendar/', include('calendar_events.urls')),
    path('api/strikes/', include('strikes.urls')),
    path('questionnaires/', include('questionnaires.urls')),
    path('platform-settings/', include('platform_settings.urls')),
    path('trl-levels/', include('trl_levels.urls')),
    path('api/areas/', include('areas.urls')),
    path('project-status/', include('project_status.urls')),
    path('assignments/', include('assignments.urls')),
    path('evaluation-categories/', include('evaluation_categories.urls')),
    path('ratings/', include('ratings.urls')),
    path('api/mass-notifications/', include('mass_notifications.urls')),
    path('disciplinary-records/', include('disciplinary_records.urls')),
    path('documents/', include('documents.urls')),
    path('activity-logs/', include('activity_logs.urls')),
    path('reports/', include('reports.urls')),
    path('data-backups/', include('data_backups.urls')),
    path('api/admin/', include('custom_admin.urls')),
    
    # API endpoints (para futuras implementaciones)
    path('api/', include([
        path('health-simple/', views.health_check, name='health_check'),
        path('dashboard/', views.api_dashboard, name='api_dashboard'),
        path('dashboard/student_stats/', views.api_dashboard_student_stats, name='api_dashboard_student_stats'),
        path('dashboard/company_stats/', views.api_dashboard_company_stats, name='api_dashboard_company_stats'),
        path('dashboard/admin_stats/', views.api_dashboard_admin_stats, name='api_dashboard_admin_stats'),
        path('users/profile/', views.api_user_profile, name='api_user_profile'),
        path('users/change-password/', views.api_change_password, name='api_change_password'),
        path('token/', views.api_login, name='api_login'),
        path('token/refresh/', views.api_refresh_token, name='api_refresh_token'),
        path('token/verify/', views.api_verify_token, name='api_verify_token'),
        path('auth/register/', views.api_register, name='api_register'),
        path('auth/logout/', views.api_logout, name='api_logout'),
    ])),
    path('api/test-projects/', views.api_test_projects, name='api_test_projects'),
    path('api/test-admin-stats/', views.api_test_admin_stats, name='api_test_admin_stats'),
    path('api/test-auth-admin-stats/', views.api_test_auth_admin_stats, name='api_test_auth_admin_stats'),
    
    # Redirección por defecto
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico')),
]

# Configuración para archivos estáticos y media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Debug toolbar
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ] 