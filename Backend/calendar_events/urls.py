"""
URLs para la app calendar_events.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.calendar_events_list, name='calendar_events_list'),
    path('<str:calendar_events_id>/', views.calendar_events_detail, name='calendar_events_detail'),
    path('create/', views.calendar_events_create, name='calendar_events_create'),
    path('<str:calendar_events_id>/update/', views.calendar_events_update, name='calendar_events_update'),
    path('<str:calendar_events_id>/delete/', views.calendar_events_delete, name='calendar_events_delete'),
]
