from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    """Admin para logs de actividad"""
    list_display = [
        'user_name', 'action', 'entity_type', 'entity_id', 
        'ip_address', 'is_recent_display', 'created_at'
    ]
    list_filter = [
        'action', 'entity_type', 'created_at', 'user'
    ]
    search_fields = [
        'action', 'details', 'user__full_name', 'user__email', 
        'ip_address', 'entity_type', 'entity_id'
    ]
    readonly_fields = [
        'user', 'action', 'entity_type', 'entity_id', 'details',
        'ip_address', 'user_agent', 'content_type', 'object_id', 'created_at',
        'is_recent_display', 'related_object_link'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    
    fieldsets = (
        ('Información de la Actividad', {
            'fields': ('user', 'action', 'details')
        }),
        ('Entidad Relacionada', {
            'fields': ('entity_type', 'entity_id', 'related_object_link'),
            'description': 'Información sobre la entidad relacionada con la actividad'
        }),
        ('Información Técnica', {
            'fields': ('ip_address', 'user_agent', 'content_type', 'object_id'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('created_at', 'is_recent_display'),
            'classes': ('collapse',)
        }),
    )

    def user_name(self, obj):
        """Nombre del usuario con enlace"""
        if obj.user:
            url = reverse('admin:users_usuario_change', args=[obj.user.id])
            return format_html('<a href="{}">{}</a>', url, obj.user.full_name)
        return '-'
    user_name.short_description = 'Usuario'

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

    def related_object_link(self, obj):
        """Enlace al objeto relacionado si existe"""
        if obj.content_type and obj.object_id:
            try:
                related_obj = obj.content_type.get_object_for_this_type(id=obj.object_id)
                model_name = obj.content_type.model
                app_label = obj.content_type.app_label
                
                # Intentar crear enlace al admin
                try:
                    url = reverse(f'admin:{app_label}_{model_name}_change', args=[obj.object_id])
                    return format_html(
                        '<a href="{}">{}</a>',
                        url, str(related_obj)
                    )
                except:
                    return str(related_obj)
            except:
                return f"{obj.content_type.model} #{obj.object_id}"
        return '-'
    related_object_link.short_description = 'Objeto Relacionado'

    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related(
            'user', 'content_type'
        )

    def has_add_permission(self, request):
        """No permitir crear logs manualmente"""
        return False

    def has_change_permission(self, request, obj=None):
        """No permitir editar logs"""
        return False

    def has_delete_permission(self, request, obj=None):
        """Solo superusuarios pueden eliminar logs"""
        return request.user.is_superuser

    actions = ['export_to_csv', 'export_security_events']

    def export_to_csv(self, request, queryset):
        """Exportar logs a CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="activity_logs.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Usuario', 'Acción', 'Tipo Entidad', 'ID Entidad', 'Detalles',
            'IP', 'User Agent', 'Fecha'
        ])
        
        for log in queryset:
            writer.writerow([
                log.user.full_name if log.user else '',
                log.action,
                log.entity_type or '',
                log.entity_id or '',
                log.details or '',
                log.ip_address or '',
                log.user_agent or '',
                log.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response
    export_to_csv.short_description = "Exportar a CSV"

    def export_security_events(self, request, queryset):
        """Exportar eventos de seguridad"""
        import csv
        from django.http import HttpResponse
        
        security_actions = ['login', 'logout', 'password_change', 'password_reset', 'failed_login']
        security_logs = queryset.filter(action__in=security_actions)
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="security_events.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Usuario', 'Acción', 'IP', 'User Agent', 'Fecha'
        ])
        
        for log in security_logs:
            writer.writerow([
                log.user.full_name if log.user else '',
                log.action,
                log.ip_address or '',
                log.user_agent or '',
                log.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response
    export_security_events.short_description = "Exportar eventos de seguridad"
