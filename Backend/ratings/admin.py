from django.contrib import admin
from .models import Rating

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['id', 'project', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at', 'project']
    search_fields = ['project__title', 'user__email', 'user__full_name', 'comment']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'project', 'user', 'rating')
        }),
        ('Comentario', {
            'fields': ('comment',),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('project', 'user')
