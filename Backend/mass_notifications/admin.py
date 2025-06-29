from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import MassNotification, NotificationTemplate


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    """Admin para plantillas de notificaciones"""
    list_display = ['name', 'notification_type', 'is_active', 'created_by', 'created_at']
    list_filter = ['notification_type', 'is_active', 'created_at']
    search_fields = ['name', 'title_template', 'message_template']
    readonly_fields = ['created_by', 'created_at', 'updated_at']
    ordering = ['name']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'notification_type', 'is_active')
        }),
        ('Plantilla', {
            'fields': ('title_template', 'message_template'),
            'description': 'Use variables como $nombre, $fecha, etc. en las plantillas'
        }),
        ('Metadatos', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:  # Si es una nueva plantilla
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(MassNotification)
class MassNotificationAdmin(admin.ModelAdmin):
    """Admin para notificaciones masivas"""
    list_display = [
        'title', 'notification_type', 'priority', 'status', 
        'total_recipients', 'sent_count', 'success_rate_display',
        'created_by', 'created_at'
    ]
    list_filter = [
        'status', 'notification_type', 'priority', 'created_at',
        'target_all_students', 'target_all_companies'
    ]
    search_fields = ['title', 'message', 'created_by__email']
    readonly_fields = [
        'created_by', 'created_at', 'updated_at', 'sent_at',
        'total_recipients', 'sent_count', 'failed_count', 'read_count',
        'success_rate_display', 'read_rate_display'
    ]
    ordering = ['-created_at']
    filter_horizontal = ['target_students', 'target_companies']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'message', 'notification_type', 'priority', 'status')
        }),
        ('Destinatarios', {
            'fields': (
                'target_all_students', 'target_students',
                'target_all_companies', 'target_companies'
            ),
            'description': 'Seleccione destinatarios específicos o marque para enviar a todos'
        }),
        ('Programación', {
            'fields': ('scheduled_at',),
            'classes': ('collapse',)
        }),
        ('Estadísticas', {
            'fields': (
                'total_recipients', 'sent_count', 'failed_count', 'read_count',
                'success_rate_display', 'read_rate_display'
            ),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('created_by', 'created_at', 'updated_at', 'sent_at'),
            'classes': ('collapse',)
        }),
    )

    def success_rate_display(self, obj):
        """Muestra la tasa de éxito con color"""
        rate = obj.success_rate
        if rate >= 90:
            color = 'green'
        elif rate >= 70:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color, rate
        )
    success_rate_display.short_description = 'Tasa de Éxito'

    def read_rate_display(self, obj):
        """Muestra la tasa de lectura con color"""
        rate = obj.read_rate
        if rate >= 50:
            color = 'green'
        elif rate >= 25:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color, rate
        )
    read_rate_display.short_description = 'Tasa de Lectura'

    def save_model(self, request, obj, form, change):
        if not change:  # Si es una nueva notificación
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related('created_by')

    actions = ['mark_as_sent', 'mark_as_cancelled', 'calculate_recipients']

    def mark_as_sent(self, request, queryset):
        """Marcar notificaciones como enviadas"""
        count = 0
        for notification in queryset:
            if notification.status in ['draft', 'scheduled']:
                notification.mark_as_sent()
                count += 1
        self.message_user(
            request,
            f'{count} notificación(es) marcada(s) como enviada(s)'
        )
    mark_as_sent.short_description = "Marcar como enviadas"

    def mark_as_cancelled(self, request, queryset):
        """Marcar notificaciones como canceladas"""
        count = queryset.filter(status__in=['draft', 'scheduled']).update(status='cancelled')
        self.message_user(
            request,
            f'{count} notificación(es) cancelada(s)'
        )
    mark_as_cancelled.short_description = "Cancelar notificaciones"

    def calculate_recipients(self, request, queryset):
        """Recalcular destinatarios"""
        count = 0
        for notification in queryset:
            notification.calculate_recipients()
            count += 1
        self.message_user(
            request,
            f'Destinatarios recalculados para {count} notificación(es)'
        )
    calculate_recipients.short_description = "Recalcular destinatarios"
