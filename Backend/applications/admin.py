from django.contrib import admin
from .models import Application

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('project', 'student_name', 'status', 'application_date')
    search_fields = ('project__title', 'student__user__first_name', 'student__user__last_name', 'student__user__email')
    list_filter = ('status', 'application_date', 'project__company')
    ordering = ('-application_date',)
    date_hierarchy = 'application_date'
    raw_id_fields = ('project', 'student') # Mejora el rendimiento para muchos proyectos/estudiantes

    def student_name(self, obj):
        return obj.student
    student_name.short_description = 'Estudiante'
