from django.contrib import admin
from .models import Empresa, CalificacionEmpresa

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'industry', 'city', 'user_email')
    search_fields = ('company_name', 'industry', 'user__email')
    list_filter = ('industry', 'city')
    ordering = ('company_name',)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email del Usuario'
