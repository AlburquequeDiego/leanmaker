from django.contrib import admin
from .models import Aplicacion

@admin.register(Aplicacion)
class AplicacionAdmin(admin.ModelAdmin):
    list_display = ('project', 'student_name', 'status', 'applied_at')
    search_fields = ('project__title', 'student__user__first_name', 'student__user__last_name', 'student__user__email')
    list_filter = ('status', 'applied_at', 'project__company')
    ordering = ('-applied_at',)
    date_hierarchy = 'applied_at'
    raw_id_fields = ('project', 'student') # Mejora el rendimiento para muchos proyectos/estudiantes

    def student_name(self, obj):
        return obj.student
    student_name.short_description = 'Estudiante'
