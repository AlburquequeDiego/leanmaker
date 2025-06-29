from django.contrib import admin
from .models import Proyecto, AplicacionProyecto, MiembroProyecto

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'empresa', 'estado', 'fecha_creacion')
    list_filter = ('estado', 'fecha_creacion', 'empresa')
    search_fields = ('titulo', 'descripcion', 'empresa__nombre_empresa')

admin.site.register(Proyecto, ProjectAdmin)
