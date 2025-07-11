from django.contrib import admin
from .models import PlatformSetting

@admin.register(PlatformSetting)
class PlatformSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'setting_type', 'updated_at')
    list_filter = ('setting_type', 'updated_at')
    search_fields = ('key', 'value', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('key',)
