from django.contrib import admin
from .models import WorkHours

@admin.register(WorkHours)
class WorkHoursAdmin(admin.ModelAdmin):
    list_display = ('student', 'project', 'date', 'start_time', 'end_time', 'hours_worked_formatted', 'is_approved')
    list_filter = ('is_approved', 'project', 'date')
    search_fields = ('student__email', 'project__title', 'description')
    date_hierarchy = 'date'
    autocomplete_fields = ('student', 'project', 'approved_by')
    readonly_fields = ('hours_worked_formatted',)
