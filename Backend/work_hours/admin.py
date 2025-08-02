from django.contrib import admin
from .models import WorkHour


@admin.register(WorkHour)
class WorkHourAdmin(admin.ModelAdmin):
    list_display = ['student', 'project', 'date', 'hours_worked', 'created_at']
    list_filter = ['date', 'project', 'student']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'project__title']
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']
    
    fieldsets = (
        ('Información básica', {
            'fields': ('student', 'project', 'date', 'hours_worked')
        }),
        ('Detalles', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
    ) 