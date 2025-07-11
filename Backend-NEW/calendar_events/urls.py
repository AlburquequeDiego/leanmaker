, include

from .views import CalendarEventViewSet, EventReminderViewSet, CalendarSettingsViewSet


(r'events', CalendarEventViewSet, basename='calendar-event')
(r'reminders', EventReminderViewSet, basename='event-reminder')
(r'settings', CalendarSettingsViewSet, basename='calendar-settings')

urlpatterns = [
    
] 
