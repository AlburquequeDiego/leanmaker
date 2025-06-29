from django.contrib import admin
from .models import Aplicacion

@admin.register(Aplicacion)
class AplicacionAdmin(admin.ModelAdmin):
    list_display = ('proyecto', 'estudiante_nombre', 'estado', 'fecha_aplicacion')
    search_fields = ('proyecto__titulo', 'estudiante__usuario__first_name', 'estudiante__usuario__last_name', 'estudiante__usuario__email')
    list_filter = ('estado', 'fecha_aplicacion', 'proyecto__empresa')
    ordering = ('-fecha_aplicacion',)
    date_hierarchy = 'fecha_aplicacion'
    raw_id_fields = ('proyecto', 'estudiante') # Mejora el rendimiento para muchos proyectos/estudiantes

    def estudiante_nombre(self, obj):
        return obj.estudiante
    estudiante_nombre.short_description = 'Estudiante'
