from django.contrib import admin
from .models import Strike

@admin.register(Strike)
class StrikeAdmin(admin.ModelAdmin):
    list_display = ('student', 'company', 'reason', 'severity', 'issued_by', 'issued_at', 'is_active')
    search_fields = ('student__user__email', 'company__company_name', 'reason')
    list_filter = ('severity', 'is_active', 'issued_at')
    ordering = ('-issued_at',)
    raw_id_fields = ('student', 'company')
