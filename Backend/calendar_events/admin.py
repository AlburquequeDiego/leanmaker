from django.contrib import admin
from .models import CalendarEvent

class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'created_by')
    list_filter = ('start_date', 'end_date', 'created_by')
    search_fields = ('title', 'description')

admin.site.register(CalendarEvent, CalendarEventAdmin)
