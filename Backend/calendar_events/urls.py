"""
URLs para la app calendar_events.
"""

from django.urls import path
from . import views

app_name = 'calendar_events'

urlpatterns = [
    path('', views.calendar_events_list, name='calendar_events_list'),
    path('<int:event_id>/', views.calendar_event_detail, name='calendar_event_detail'),
    path('student_events/', views.student_events, name='student_events'),
    path('company_events/', views.company_events, name='company_events'),
]
