, include

from .views import EstudianteViewSet, PerfilEstudianteViewSet


(r'students', EstudianteViewSet, basename='student')
(r'student-profiles', PerfilEstudianteViewSet, basename='student-profile')

urlpatterns = [
    
] 
