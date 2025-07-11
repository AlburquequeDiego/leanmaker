, include

from .views import NotificationViewSet, NotificationTemplateViewSet, NotificationPreferenceViewSet


(r'notifications', NotificationViewSet, basename='notification')
(r'templates', NotificationTemplateViewSet, basename='notification-template')
(r'preferences', NotificationPreferenceViewSet, basename='notification-preference')

urlpatterns = [
    
] 
