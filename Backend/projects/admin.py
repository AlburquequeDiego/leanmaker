from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'status', 'duration_in_weeks', 'positions_to_fill', 'created_at')
    search_fields = ('title', 'company__name', 'description', 'requirements')
    list_filter = ('status', 'company', 'duration_in_weeks')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Información Principal', {
            'fields': ('title', 'company', 'status')
        }),
        ('Detalles del Proyecto', {
            'fields': ('description', 'requirements', 'duration_in_weeks', 'positions_to_fill')
        }),
    )
