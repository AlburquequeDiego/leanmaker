from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# Importar ViewSets
from users.views import (
    UserViewSet, AuthViewSet, PasswordViewSet, DashboardViewSet
)
from projects.views import (
    ProjectViewSet, ProjectApplicationViewSet, ProjectMemberViewSet
)
from evaluations.views import (
    EvaluationViewSet, EvaluationCriteriaViewSet, EvaluationResponseViewSet
)
from notifications.views import (
    NotificationViewSet, NotificationTemplateViewSet
)
from calendar_events.views import (
    CalendarEventViewSet, EventTypeViewSet
)
from strikes.views import (
    StrikeViewSet, StrikeTypeViewSet
)
from work_hours.views import (
    WorkHourViewSet, WorkHourTypeViewSet
)
from questionnaires.views import (
    QuestionnaireViewSet, QuestionViewSet, QuestionnaireResponseViewSet, QuestionResponseViewSet
)
from interviews.views import (
    InterviewViewSet, InterviewQuestionViewSet, InterviewResponseViewSet
)
from platform_settings.views import (
    PlatformSettingViewSet, SystemConfigurationViewSet, FeatureFlagViewSet
)
from search.views import (
    SearchViewSet, SearchHistoryViewSet, SearchSuggestionViewSet
)
from api_management.views import (
    APIKeyViewSet, APIUsageViewSet, APIRateLimitViewSet
)

# Importar ViewSets de los nuevos módulos
from mass_notifications.views import (
    MassNotificationViewSet, NotificationTemplateViewSet as MassNotificationTemplateViewSet
)
from disciplinary_records.views import DisciplinaryRecordViewSet
from documents.views import DocumentViewSet
from activity_logs.views import ActivityLogViewSet
from reports.views import ReportViewSet
from data_backups.views import DataBackupViewSet

# Crear router principal
router = DefaultRouter()

# Registrar ViewSets de usuarios
router.register(r'users', UserViewSet, basename='user')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'passwords', PasswordViewSet, basename='password')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

# Registrar ViewSets de proyectos
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'project-applications', ProjectApplicationViewSet, basename='project-application')
router.register(r'project-members', ProjectMemberViewSet, basename='project-member')

# Registrar ViewSets de evaluaciones
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'evaluation-criteria', EvaluationCriteriaViewSet, basename='evaluation-criteria')
router.register(r'evaluation-responses', EvaluationResponseViewSet, basename='evaluation-response')

# Registrar ViewSets de notificaciones
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'notification-templates', NotificationTemplateViewSet, basename='notification-template')

# Registrar ViewSets de eventos de calendario
router.register(r'calendar-events', CalendarEventViewSet, basename='calendar-event')
router.register(r'event-types', EventTypeViewSet, basename='event-type')

# Registrar ViewSets de strikes
router.register(r'strikes', StrikeViewSet, basename='strike')
router.register(r'strike-types', StrikeTypeViewSet, basename='strike-type')

# Registrar ViewSets de horas de trabajo
router.register(r'work-hours', WorkHourViewSet, basename='work-hour')
router.register(r'work-hour-types', WorkHourTypeViewSet, basename='work-hour-type')

# Registrar ViewSets de cuestionarios
router.register(r'questionnaires', QuestionnaireViewSet, basename='questionnaire')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'questionnaire-responses', QuestionnaireResponseViewSet, basename='questionnaire-response')
router.register(r'question-responses', QuestionResponseViewSet, basename='question-response')

# Registrar ViewSets de entrevistas
router.register(r'interviews', InterviewViewSet, basename='interview')
router.register(r'interview-questions', InterviewQuestionViewSet, basename='interview-question')
router.register(r'interview-responses', InterviewResponseViewSet, basename='interview-response')

# Registrar ViewSets de configuraciones de plataforma
router.register(r'platform-settings', PlatformSettingViewSet, basename='platform-setting')
router.register(r'system-configurations', SystemConfigurationViewSet, basename='system-configuration')
router.register(r'feature-flags', FeatureFlagViewSet, basename='feature-flag')

# Registrar ViewSets de búsqueda
router.register(r'search', SearchViewSet, basename='search')
router.register(r'search-history', SearchHistoryViewSet, basename='search-history')
router.register(r'search-suggestions', SearchSuggestionViewSet, basename='search-suggestion')

# Registrar ViewSets de gestión de APIs
router.register(r'api-keys', APIKeyViewSet, basename='api-key')
router.register(r'api-usage', APIUsageViewSet, basename='api-usage')
router.register(r'api-rate-limits', APIRateLimitViewSet, basename='api-rate-limit')

# Registrar ViewSets de los nuevos módulos
router.register(r'mass-notifications', MassNotificationViewSet, basename='mass-notification')
router.register(r'mass-notification-templates', MassNotificationTemplateViewSet, basename='mass-notification-template')
router.register(r'disciplinary-records', DisciplinaryRecordViewSet, basename='disciplinary-record')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'data-backups', DataBackupViewSet, basename='data-backup')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/v1/', include(router.urls)),
    
    # JWT Authentication URLs
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # API Documentation
    path('api/v1/docs/', include('rest_framework.urls')),
    
    # Health check
    path('api/v1/health/', include('health_check.urls')),
] 
