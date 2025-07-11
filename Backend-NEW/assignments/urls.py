, include

from .views import AssignmentViewSet


(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    
] 