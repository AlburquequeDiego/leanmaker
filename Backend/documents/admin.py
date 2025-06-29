from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Admin para documentos"""
    list_display = [
        'title', 'document_type_display', 'project_name', 'uploaded_by_name',
        'file_size_display', 'download_count', 'is_public_display', 'created_at'
    ]
    list_filter = [
        'document_type', 'is_public', 'created_at', 'project', 'uploaded_by'
    ]
    search_fields = [
        'title', 'description', 'uploaded_by__full_name', 
        'uploaded_by__email', 'project__title'
    ]
    readonly_fields = [
        'uploaded_by', 'created_at', 'updated_at', 'file_size', 
        'file_type', 'download_count', 'file_size_mb_display', 'file_extension_display'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'description', 'document_type', 'project')
        }),
        ('Archivo', {
            'fields': ('file', 'file_url', 'file_type', 'file_size_mb_display', 'file_extension_display'),
            'description': 'Información del archivo subido'
        }),
        ('Configuración', {
            'fields': ('is_public', 'download_count'),
            'description': 'Configuración de visibilidad y estadísticas'
        }),
        ('Metadatos', {
            'fields': ('uploaded_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def project_name(self, obj):
        """Nombre del proyecto con enlace"""
        if obj.project:
            url = reverse('admin:projects_proyecto_change', args=[obj.project.id])
            return format_html('<a href="{}">{}</a>', url, obj.project.title)
        return '-'
    project_name.short_description = 'Proyecto'

    def uploaded_by_name(self, obj):
        """Nombre del usuario que subió el archivo"""
        if obj.uploaded_by:
            return obj.uploaded_by.full_name
        return '-'
    uploaded_by_name.short_description = 'Subido por'

    def document_type_display(self, obj):
        """Mostrar tipo de documento con icono"""
        icons = {
            'contract': '📄',
            'proposal': '📋',
            'report': '📊',
            'presentation': '📽️',
            'manual': '📖',
            'certificate': '🏆',
            'other': '📁'
        }
        icon = icons.get(obj.document_type, '📄')
        return format_html(
            '{} {}',
            icon, obj.get_document_type_display()
        )
    document_type_display.short_description = 'Tipo'

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

    def file_extension_display(self, obj):
        """Mostrar extensión del archivo"""
        ext = obj.file_extension
        if ext:
            return format_html(
                '<span style="font-weight: bold; color: #007bff;">{}</span>',
                ext
            )
        return '-'
    file_extension_display.short_description = 'Extensión'

    def is_public_display(self, obj):
        """Mostrar estado de visibilidad"""
        if obj.is_public:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Público</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Privado</span>'
        )
    is_public_display.short_description = 'Visibilidad'

    def save_model(self, request, obj, form, change):
        if not change:  # Si es un nuevo documento
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related(
            'uploaded_by', 'project'
        )

    actions = ['make_public', 'make_private', 'export_to_csv']

    def make_public(self, request, queryset):
        """Marcar documentos como públicos"""
        count = queryset.update(is_public=True)
        self.message_user(
            request,
            f'{count} documento(s) marcado(s) como público(s)'
        )
    make_public.short_description = "Marcar como públicos"

    def make_private(self, request, queryset):
        """Marcar documentos como privados"""
        count = queryset.update(is_public=False)
        self.message_user(
            request,
            f'{count} documento(s) marcado(s) como privado(s)'
        )
    make_private.short_description = "Marcar como privados"

    def export_to_csv(self, request, queryset):
        """Exportar documentos a CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="documentos.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Título', 'Descripción', 'Tipo', 'Proyecto', 'Subido por',
            'Tamaño (MB)', 'Descargas', 'Público', 'Fecha Creación'
        ])
        
        for document in queryset:
            writer.writerow([
                document.title,
                document.description or '',
                document.get_document_type_display(),
                document.project.title if document.project else '',
                document.uploaded_by.full_name if document.uploaded_by else '',
                round(document.file_size_mb, 2),
                document.download_count,
                'Sí' if document.is_public else 'No',
                document.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response
    export_to_csv.short_description = "Exportar a CSV"
