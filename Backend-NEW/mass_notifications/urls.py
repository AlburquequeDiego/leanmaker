, include

from .views import MassNotificationViewSet


(r'mass-notifications', MassNotificationViewSet, basename='mass-notification')

urlpatterns = [
    
] 