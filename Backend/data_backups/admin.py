from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import DataBackup


@admin.register(DataBackup)
class DataBackupAdmin(admin.ModelAdmin):
    """Admin para respaldos de datos"""
    list_display = [
        'backup_name', 'backup_type', 'status_display', 'created_by_name',
        'file_size_display', 'duration_display', 'is_expired_display', 'created_at'
    ]
    list_filter = [
        'backup_type', 'status', 'created_at', 'completed_at', 'created_by'
    ]
    search_fields = [
        'backup_name', 'created_by__full_name', 'created_by__email'
    ]
    readonly_fields = [
        'created_by', 'created_at', 'completed_at', 'file_size_mb_display',
        'file_size_gb_display', 'duration_minutes_display', 'is_expired_display',
        'is_completed_display'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('backup_name', 'backup_type', 'status')
        }),
        ('Archivo del Respaldo', {
            'fields': ('file_url', 'file_size_mb_display', 'file_size_gb_display'),
            'description': 'Información del archivo de respaldo'
        }),
        ('Metadatos', {
            'fields': ('created_by', 'created_at', 'completed_at', 'duration_minutes_display', 'is_completed_display', 'is_expired_display'),
            'classes': ('collapse',)
        }),
    )

    def created_by_name(self, obj):
        """Nombre del usuario que creó el respaldo"""
        if obj.created_by:
            return obj.created_by.full_name
        return '-'
    created_by_name.short_description = 'Creado por'

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

    def file_size_gb_display(self, obj):
        """Mostrar tamaño en GB en campos de solo lectura"""
        return f"{obj.file_size_gb:.2f} GB"
    file_size_gb_display.short_description = 'Tamaño (GB)'

    def duration_display(self, obj):
        """Mostrar duración del respaldo"""
        minutes = obj.duration_minutes
        if minutes is None:
            return '-'
        elif minutes < 60:
            return f"{minutes:.1f} min"
        else:
            hours = minutes / 60
            return f"{hours:.1f} horas"
    duration_display.short_description = 'Duración'

    def duration_minutes_display(self, obj):
        """Mostrar duración en minutos en campos de solo lectura"""
        minutes = obj.duration_minutes
        if minutes is None:
            return '-'
        return f"{minutes:.1f} minutos"
    duration_minutes_display.short_description = 'Duración (minutos)'

    def is_expired_display(self, obj):
        """Indica si el respaldo ha expirado"""
        if obj.is_expired:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Expirado</span>'
            )
        return format_html(
            '<span style="color: green; font-weight: bold;">✓ Válido</span>'
        )
    is_expired_display.short_description = 'Estado de Expiración'

    def is_completed_display(self, obj):
        """Indica si el respaldo está completado"""
        if obj.is_completed:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Completado</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Pendiente</span>'
        )
    is_completed_display.short_description = 'Estado de Completado'

    def save_model(self, request, obj, form, change):
        if not change:  # Si es un nuevo respaldo
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related('created_by')

    actions = ['mark_as_completed', 'mark_as_failed', 'export_to_csv']

    def mark_as_completed(self, request, queryset):
        """Marcar respaldos como completados"""
        count = 0
        for backup in queryset:
            if backup.status == 'pending':
                backup.mark_as_completed(
                    file_path=f"/backups/{backup.id}_{backup.backup_type}.sql",
                    file_size=50 * 1024 * 1024,  # 50MB simulado
                    checksum="simulated_checksum"
                )
                count += 1
        self.message_user(
            request,
            f'{count} respaldo(s) marcado(s) como completado(s)'
        )
    mark_as_completed.short_description = "Marcar como completados"

    def mark_as_failed(self, request, queryset):
        """Marcar respaldos como fallidos"""
        count = queryset.filter(status='pending').update(status='failed')
        self.message_user(
            request,
            f'{count} respaldo(s) marcado(s) como fallido(s)'
        )
    mark_as_failed.short_description = "Marcar como fallidos"

    def export_to_csv(self, request, queryset):
        """Exportar respaldos a CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="respaldos.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Nombre', 'Tipo', 'Estado', 'Creado por', 'Tamaño (MB)',
            'Duración (min)', 'Fecha Creación', 'Fecha Completado'
        ])
        
        for backup in queryset:
            writer.writerow([
                backup.backup_name,
                backup.get_backup_type_display(),
                backup.get_status_display(),
                backup.created_by.full_name if backup.created_by else '',
                round(backup.file_size_mb, 2) if backup.file_size_mb else 0,
                f"{backup.duration_minutes:.1f}" if backup.duration_minutes else '',
                backup.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                backup.completed_at.strftime('%Y-%m-%d %H:%M:%S') if backup.completed_at else ''
            ])
        
        return response
    export_to_csv.short_description = "Exportar a CSV"
