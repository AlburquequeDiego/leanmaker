from django.contrib import admin
from .models import DataBackups


@admin.register(DataBackups)
class DataBackupsAdmin(admin.ModelAdmin):
    list_display = ['backup_name', 'backup_type', 'status', 'created_at', 'created_by']
    list_filter = ['backup_type', 'status', 'created_at']
    search_fields = ['backup_name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('backup_name', 'backup_type', 'created_by')
        }),
        ('Archivos', {
            'fields': ('file_url', 'file_path', 'file_size', 'checksum')
        }),
        ('Estado y Fechas', {
            'fields': ('status', 'completed_at', 'expires_at')
        }),
        ('Descripción', {
            'fields': ('description',)
        }),
    )
