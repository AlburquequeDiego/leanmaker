, include

from .views import ApplicationViewSet, AssignmentViewSet


(r'applications', ApplicationViewSet, basename='application')
(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    
] 
