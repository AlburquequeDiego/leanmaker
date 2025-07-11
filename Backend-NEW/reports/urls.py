, include

from .views import ReportViewSet


(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    
] 