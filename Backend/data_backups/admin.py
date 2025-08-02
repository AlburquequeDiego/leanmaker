from django.contrib import admin
from .models import DataBackups


@admin.register(DataBackups)
class DataBackupsAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
