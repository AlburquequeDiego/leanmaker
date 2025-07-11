, include

from .views import DisciplinaryRecordViewSet


(r'records', DisciplinaryRecordViewSet, basename='disciplinary-record')

urlpatterns = [
    
] 