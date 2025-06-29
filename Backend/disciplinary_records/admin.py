from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import DisciplinaryRecord


@admin.register(DisciplinaryRecord)
class DisciplinaryRecordAdmin(admin.ModelAdmin):
    """Admin para registros disciplinarios"""
    list_display = [
        'student_name', 'company_name', 'incident_date', 'severity_display',
        'has_action', 'recorded_by_name', 'is_recent_display'
    ]
    list_filter = [
        'severity', 'incident_date', 'recorded_at', 'company', 'recorded_by'
    ]
    search_fields = [
        'description', 'action_taken', 'student__user__full_name', 
        'student__user__email', 'company__name'
    ]
    readonly_fields = [
        'recorded_by', 'recorded_at', 'is_recent_display', 'severity_color_display'
    ]
    ordering = ['-incident_date']
    date_hierarchy = 'incident_date'
    
    fieldsets = (
        ('Información del Incidente', {
            'fields': ('student', 'company', 'incident_date', 'description')
        }),
        ('Acción Disciplinaria', {
            'fields': ('action_taken', 'severity', 'severity_color_display'),
            'description': 'Detalle la acción disciplinaria tomada y la severidad del incidente'
        }),
        ('Metadatos', {
            'fields': ('recorded_by', 'recorded_at', 'is_recent_display'),
            'classes': ('collapse',)
        }),
    )

    def student_name(self, obj):
        """Nombre del estudiante con enlace"""
        if obj.student and obj.student.user:
            url = reverse('admin:students_estudiante_change', args=[obj.student.id])
            return format_html('<a href="{}">{}</a>', url, obj.student.user.full_name)
        return '-'
    student_name.short_description = 'Estudiante'

    def company_name(self, obj):
        """Nombre de la empresa con enlace"""
        if obj.company:
            url = reverse('admin:companies_empresa_change', args=[obj.company.id])
            return format_html('<a href="{}">{}</a>', url, obj.company.name)
        return '-'
    company_name.short_description = 'Empresa'

    def recorded_by_name(self, obj):
        """Nombre del usuario que registró"""
        if obj.recorded_by:
            return obj.recorded_by.full_name
        return '-'
    recorded_by_name.short_description = 'Registrado por'

    def severity_display(self, obj):
        """Mostrar severidad con color"""
        colors = {
            'low': 'green',
            'medium': 'orange',
            'high': 'red',
            'critical': 'darkred'
        }
        color = colors.get(obj.severity, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_severity_display()
        )
    severity_display.short_description = 'Severidad'

    def severity_color_display(self, obj):
        """Mostrar color de severidad"""
        return format_html(
            '<div style="width: 20px; height: 20px; background-color: {}; border-radius: 3px;"></div>',
            obj.severity_color
        )
    severity_color_display.short_description = 'Color'

    def has_action(self, obj):
        """Indica si tiene acción disciplinaria"""
        if obj.action_taken:
            return format_html(
                '<span style="color: green;">✓</span>'
            )
        return format_html(
            '<span style="color: red;">✗</span>'
        )
    has_action.short_description = 'Acción'

    def is_recent_display(self, obj):
        """Indica si es reciente"""
        if obj.is_recent:
            return format_html(
                '<span style="color: orange; font-weight: bold;">Reciente</span>'
            )
        return format_html(
            '<span style="color: gray;">Antiguo</span>'
        )
    is_recent_display.short_description = 'Estado'

    def save_model(self, request, obj, form, change):
        if not change:  # Si es un nuevo registro
            obj.recorded_by = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related(
            'student__user', 'company', 'recorded_by'
        )

    actions = ['mark_as_resolved', 'export_to_csv']

    def mark_as_resolved(self, request, queryset):
        """Marcar registros como resueltos (agregar acción si no tiene)"""
        count = 0
        for record in queryset:
            if not record.action_taken:
                record.action_taken = "Acción disciplinaria aplicada"
                record.save()
                count += 1
        self.message_user(
            request,
            f'{count} registro(s) marcado(s) como resuelto(s)'
        )
    mark_as_resolved.short_description = "Marcar como resueltos"

    def export_to_csv(self, request, queryset):
        """Exportar registros a CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="registros_disciplinarios.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Estudiante', 'Empresa', 'Fecha Incidente', 'Descripción',
            'Acción Tomada', 'Severidad', 'Registrado por', 'Fecha Registro'
        ])
        
        for record in queryset:
            writer.writerow([
                record.student.user.full_name if record.student and record.student.user else '',
                record.company.name if record.company else '',
                record.incident_date,
                record.description,
                record.action_taken or '',
                record.get_severity_display(),
                record.recorded_by.full_name if record.recorded_by else '',
                record.recorded_at
            ])
        
        return response
    export_to_csv.short_description = "Exportar a CSV"
