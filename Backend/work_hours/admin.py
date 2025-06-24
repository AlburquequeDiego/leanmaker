from django.contrib import admin
from .models import WorkHours

class WorkHoursAdmin(admin.ModelAdmin):
    list_display = ('student', 'project', 'hours_worked', 'date', 'approved_by')
    list_filter = ('date', 'approved_by', 'project')
    search_fields = ('student__email', 'project__title', 'description')

admin.site.register(WorkHours, WorkHoursAdmin)
