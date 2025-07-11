, include

from .views import EmpresaViewSet, CalificacionEmpresaViewSet


(r'companies', EmpresaViewSet, basename='company')
(r'ratings', CalificacionEmpresaViewSet, basename='company-rating')

urlpatterns = [
    
] 
