from django.contrib import admin
from .models import CalendarEvent

@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'event_type', 'start_date', 'end_date', 'created_by')
    list_filter = ('event_type', 'project', 'start_date')
    search_fields = ('title', 'description', 'project__title', 'created_by__email')
    date_hierarchy = 'start_date'
    filter_horizontal = ('participants',)
    autocomplete_fields = ('project', 'created_by')
