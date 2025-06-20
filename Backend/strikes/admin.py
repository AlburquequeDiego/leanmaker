from django.contrib import admin
from .models import Strike

@admin.register(Strike)
class StrikeAdmin(admin.ModelAdmin):
    list_display = ('student', 'project', 'company', 'created_at')
    list_filter = ('company', 'project', 'created_at')
    search_fields = ('student__user__email', 'project__title', 'company__name', 'reason')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    raw_id_fields = ('student', 'project', 'company')
