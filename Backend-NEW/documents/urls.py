, include

from .views import DocumentViewSet


(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    
] 