from django.contrib import admin
from .models import DisciplinaryRecords


@admin.register(DisciplinaryRecords)
class DisciplinaryRecordsAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
