from django.contrib import admin
from .models import MassNotification, NotificationTemplate


@admin.register(MassNotification)
class MassNotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'notification_type', 'target_audience', 'is_sent', 'sent_by', 'created_at']
    list_filter = ['notification_type', 'target_audience', 'is_sent', 'created_at']
    search_fields = ['title', 'message']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información básica', {
            'fields': ('title', 'message', 'notification_type', 'target_audience')
        }),
        ('Programación', {
            'fields': ('scheduled_at',),
            'classes': ('collapse',)
        }),
        ('Estado', {
            'fields': ('is_sent', 'sent_at', 'sent_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'template_type', 'created_at']
    list_filter = ['template_type', 'created_at']
    search_fields = ['name', 'subject', 'content']
    ordering = ['name'] 