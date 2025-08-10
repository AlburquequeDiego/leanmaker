from django.urls import path
from . import views, event_views

app_name = 'mass_notifications'

urlpatterns = [
    path('', views.notification_list, name='notification_list'),
    path('create/', views.notification_create, name='notification_create'),
    path('<int:pk>/', views.notification_detail, name='notification_detail'),
    path('<int:pk>/send/', views.notification_send, name='notification_send'),
    path('templates/', views.template_list, name='template_list'),
    path('templates/create/', views.template_create, name='template_create'),
    
    # Nuevos endpoints para eventos
    path('events/attendance/register/', event_views.register_event_attendance, name='register_event_attendance'),
    path('events/<int:event_id>/details/', event_views.get_event_details, name='get_event_details'),
    path('events/<int:event_id>/stats/', event_views.get_event_attendance_stats, name='get_event_attendance_stats'),
    path('events/stats/all/', event_views.get_all_events_stats, name='get_all_events_stats'),
] 