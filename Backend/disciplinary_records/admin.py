from django.contrib import admin
from .models import DisciplinaryRecords


@admin.register(DisciplinaryRecords)
class DisciplinaryRecordsAdmin(admin.ModelAdmin):
    list_display = ['student', 'incident_date', 'severity', 'company', 'recorded_by']
    list_filter = ['severity', 'incident_date', 'recorded_at']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'description']
    ordering = ['-recorded_at']
    
    fieldsets = (
        ('Información del Incidente', {
            'fields': ('student', 'company', 'incident_date', 'severity')
        }),
        ('Detalles', {
            'fields': ('description', 'action_taken')
        }),
        ('Registro', {
            'fields': ('recorded_by', 'recorded_at')
        }),
    )
    
    readonly_fields = ['recorded_at']
