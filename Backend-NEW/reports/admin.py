from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """Admin para reportes"""
    list_display = [
        'title', 'report_type', 'status_display', 'generated_by_name',
        'file_size_display', 'processing_time_display', 'created_at'
    ]
    list_filter = [
        'report_type', 'status', 'created_at', 'completed_at', 'generated_by'
    ]
    search_fields = [
        'title', 'description', 'generated_by__full_name', 'generated_by__email'
    ]
    readonly_fields = [
        'generated_by', 'created_at', 'completed_at', 'file_size_mb_display',
        'processing_time_display', 'is_completed_display'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'description', 'report_type', 'status')
        }),
        ('Archivo del Reporte', {
            'fields': ('file_url', 'file_size_mb_display'),
            'description': 'Información del archivo generado'
        }),
        ('Metadatos', {
            'fields': ('generated_by', 'created_at', 'completed_at', 'processing_time_display', 'is_completed_display'),
            'classes': ('collapse',)
        }),
    )

    def generated_by_name(self, obj):
        """Nombre del usuario que generó el reporte"""
        if obj.generated_by:
            return obj.generated_by.full_name
        return '-'
    generated_by_name.short_description = 'Generado por'

    def status_display(self, obj):
        """Mostrar estado con color"""
        colors = {
            'pending': 'orange',
            'completed': 'green',
            'failed': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = 'Estado'

    def file_size_display(self, obj):
        """Mostrar tamaño del archivo formateado"""
        size_mb = obj.file_size_mb
        if size_mb < 1:
            return f"{size_mb * 1024:.1f} KB"
        elif size_mb < 1024:
            return f"{size_mb:.1f} MB"
        else:
            return f"{size_mb / 1024:.1f} GB"
    file_size_display.short_description = 'Tamaño'

    def file_size_mb_display(self, obj):
        """Mostrar tamaño en MB en campos de solo lectura"""
        return f"{obj.file_size_mb:.2f} MB"
    file_size_mb_display.short_description = 'Tamaño (MB)'

    def processing_time_display(self, obj):
        """Mostrar tiempo de procesamiento"""
        time_seconds = obj.processing_time
        if time_seconds is None:
            return '-'
        elif time_seconds < 60:
            return f"{time_seconds:.1f} seg"
        else:
            minutes = time_seconds / 60
            return f"{minutes:.1f} min"
    processing_time_display.short_description = 'Tiempo de Procesamiento'

    def is_completed_display(self, obj):
        """Indica si el reporte está completado"""
        if obj.is_completed:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Completado</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Pendiente</span>'
        )
    is_completed_display.short_description = 'Estado de Completado'

    def save_model(self, request, obj, form, change):
        if not change:  # Si es un nuevo reporte
            obj.generated_by = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related('generated_by')

    actions = ['mark_as_completed', 'mark_as_failed', 'export_to_csv']

    def mark_as_completed(self, request, queryset):
        """Marcar reportes como completados"""
        count = 0
        for report in queryset:
            if report.status == 'pending':
                report.mark_as_completed(
                    file_path=f"/reports/{report.id}_{report.report_type}.pdf",
                    file_size=1024 * 1024  # 1MB simulado
                )
                count += 1
        self.message_user(
            request,
            f'{count} reporte(s) marcado(s) como completado(s)'
        )
    mark_as_completed.short_description = "Marcar como completados"

    def mark_as_failed(self, request, queryset):
        """Marcar reportes como fallidos"""
        count = queryset.filter(status='pending').update(status='failed')
        self.message_user(
            request,
            f'{count} reporte(s) marcado(s) como fallido(s)'
        )
    mark_as_failed.short_description = "Marcar como fallidos"

    def export_to_csv(self, request, queryset):
        """Exportar reportes a CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="reportes.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Título', 'Tipo', 'Estado', 'Generado por', 'Tamaño (MB)',
            'Tiempo Procesamiento', 'Fecha Creación', 'Fecha Completado'
        ])
        
        for report in queryset:
            writer.writerow([
                report.title,
                report.get_report_type_display(),
                report.get_status_display(),
                report.generated_by.full_name if report.generated_by else '',
                round(report.file_size_mb, 2) if report.file_size_mb else 0,
                f"{report.processing_time:.1f}s" if report.processing_time else '',
                report.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                report.completed_at.strftime('%Y-%m-%d %H:%M:%S') if report.completed_at else ''
            ])
        
        return response
    export_to_csv.short_description = "Exportar a CSV"
