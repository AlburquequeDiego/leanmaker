, include

from .views import ProjectStatusViewSet, ProjectStatusHistoryViewSet


(r'status', ProjectStatusViewSet, basename='project-status')
(r'history', ProjectStatusHistoryViewSet, basename='project-status-history')

urlpatterns = [
    
] 