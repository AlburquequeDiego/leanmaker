, include

from .views import DataBackupViewSet


(r'backups', DataBackupViewSet, basename='data-backup')

urlpatterns = [
    
] 