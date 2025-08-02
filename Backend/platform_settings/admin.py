from django.contrib import admin
from .models import PlatformSetting


@admin.register(PlatformSetting)
class PlatformSettingAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'setting_type', 'is_active', 'created_at']
    list_filter = ['setting_type', 'is_active', 'created_at']
    search_fields = ['key', 'value', 'description']
    ordering = ['key']
    
    fieldsets = (
        ('Información básica', {
            'fields': ('key', 'value', 'setting_type')
        }),
        ('Detalles', {
            'fields': ('description', 'is_active'),
            'classes': ('collapse',)
        }),
    ) 