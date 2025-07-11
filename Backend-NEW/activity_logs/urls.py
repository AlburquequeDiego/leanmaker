, include

from .views import ActivityLogViewSet


(r'logs', ActivityLogViewSet, basename='activity-log')

urlpatterns = [
    
] 