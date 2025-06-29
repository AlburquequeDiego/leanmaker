from django.contrib import admin
from .models import Empresa, CalificacionEmpresa

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'industria', 'ubicacion', 'usuario_email')
    search_fields = ('nombre', 'industria', 'usuario__email')
    list_filter = ('industria', 'ubicacion')
    ordering = ('nombre',)

    def usuario_email(self, obj):
        return obj.usuario.email
    usuario_email.short_description = 'Email del Usuario'
