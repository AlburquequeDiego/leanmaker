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
    EvaluationViewSet, EvaluationCategoryViewSet, EvaluationTemplateViewSet
)
from notifications.views import (
    NotificationViewSet, NotificationTemplateViewSet
)
from calendar_events.views import (
    CalendarEventViewSet, EventReminderViewSet, CalendarSettingsViewSet
)
from strikes.views import (
    StrikeViewSet  # , StrikeTypeViewSet
)
from work_hours.views import (
    WorkHourViewSet  # , WorkHourTypeViewSet
)
from questionnaires.views import (
    QuestionnaireViewSet, QuestionViewSet, ChoiceViewSet, AnswerViewSet
)
from interviews.views import (
    InterviewViewSet  # , InterviewQuestionViewSet, InterviewResponseViewSet
)
from platform_settings.views import (
    PlatformSettingViewSet  # , SystemConfigurationViewSet, FeatureFlagViewSet
)
from search.views import (
    SearchViewSet  # , SearchHistoryViewSet, SearchSuggestionViewSet
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

# Importar ViewSets adicionales que faltan
from students.views import EstudianteViewSet, PerfilEstudianteViewSet
from companies.views import EmpresaViewSet, CalificacionEmpresaViewSet

# Crear router principal
router = DefaultRouter()

# Registrar ViewSets de usuarios
router.register(r'users', UserViewSet, basename='user')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'passwords', PasswordViewSet, basename='password')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

# Registrar ViewSets de estudiantes
router.register(r'students', EstudianteViewSet, basename='student')
router.register(r'student-profiles', PerfilEstudianteViewSet, basename='student-profile')

# Registrar ViewSets de empresas
router.register(r'companies', EmpresaViewSet, basename='company')
router.register(r'company-ratings', CalificacionEmpresaViewSet, basename='company-rating')

# Registrar ViewSets de proyectos
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'project-applications', ProjectApplicationViewSet, basename='project-application')
router.register(r'project-members', ProjectMemberViewSet, basename='project-member')

# Registrar ViewSets de evaluaciones
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'evaluation-categories', EvaluationCategoryViewSet, basename='evaluation-category')
router.register(r'evaluation-templates', EvaluationTemplateViewSet, basename='evaluation-template')

# Registrar ViewSets de notificaciones
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'notification-templates', NotificationTemplateViewSet, basename='notification-template')

# Registrar ViewSets de eventos de calendario
router.register(r'calendar-events', CalendarEventViewSet, basename='calendar-event')
router.register(r'event-reminders', EventReminderViewSet, basename='event-reminder')
router.register(r'calendar-settings', CalendarSettingsViewSet, basename='calendar-setting')

# Registrar ViewSets de strikes
router.register(r'strikes', StrikeViewSet, basename='strike')

# Registrar ViewSets de horas de trabajo
router.register(r'work-hours', WorkHourViewSet, basename='work-hour')

# Registrar ViewSets de cuestionarios
router.register(r'questionnaires', QuestionnaireViewSet, basename='questionnaire')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'choices', ChoiceViewSet, basename='choice')
router.register(r'answers', AnswerViewSet, basename='answer')

# Registrar ViewSets de entrevistas
router.register(r'interviews', InterviewViewSet, basename='interview')

# Registrar ViewSets de configuraciones de plataforma
router.register(r'platform-settings', PlatformSettingViewSet, basename='platform-setting')
router.register(r'system-configurations', SystemConfigurationViewSet, basename='system-configuration')
router.register(r'feature-flags', FeatureFlagViewSet, basename='feature-flag')

# Registrar ViewSets de búsqueda
router.register(r'search', SearchViewSet, basename='search')

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
    
    # API URLs - Cambiado de /api/v1/ a /api/ para coincidir con frontend
    path('api/', include(router.urls)),
    
    # JWT Authentication URLs - Cambiado de /api/v1/ a /api/ para coincidir con frontend
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # API Documentation
    path('api/docs/', include('rest_framework.urls')),
    
    # Health check - Cambiado de /api/v1/ a /api/ para coincidir con frontend
    path('api/health-simple/', include('health_check.urls')),
] 
