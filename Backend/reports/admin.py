from django.contrib import admin
from .models import Reports


@admin.register(Reports)
class ReportsAdmin(admin.ModelAdmin):
    list_display = ['title', 'report_type', 'status', 'created_at']
    list_filter = ['report_type', 'status', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'description', 'report_type')
        }),
        ('Datos del Reporte', {
            'fields': ('report_data', 'file_url', 'file_size')
        }),
        ('Estado', {
            'fields': ('status',)
        }),
    )
