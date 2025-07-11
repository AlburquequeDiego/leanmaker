, include

from .views import ProjectViewSet, ProjectApplicationViewSet  # , ProjectMemberViewSet


(r'projects', ProjectViewSet, basename='project')
(r'applications', ProjectApplicationViewSet, basename='project-application')
# (r'members', ProjectMemberViewSet, basename='project-member')

urlpatterns = [
    
] 
