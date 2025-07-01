from rest_framework import viewsets, permissions
from .models import CalendarEvent, EventReminder, CalendarSettings
from .serializers import (
    CalendarEventSerializer, 
    EventReminderSerializer, 
    CalendarSettingsSerializer
)

class CalendarEventViewSet(viewsets.ModelViewSet):
    queryset = CalendarEvent.objects.all()
    serializer_class = CalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]

class EventReminderViewSet(viewsets.ModelViewSet):
    queryset = EventReminder.objects.all()
    serializer_class = EventReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

class CalendarSettingsViewSet(viewsets.ModelViewSet):
    queryset = CalendarSettings.objects.all()
    serializer_class = CalendarSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
