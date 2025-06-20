from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'location', 'user_email')
    search_fields = ('name', 'industry', 'user__email')
    list_filter = ('industry', 'location')
    ordering = ('name',)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email del Usuario'
