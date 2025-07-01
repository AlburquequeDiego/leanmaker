from django.contrib import admin
from .models import WorkHour

class WorkHourAdmin(admin.ModelAdmin):
    list_display = ('student', 'project', 'horas_trabajadas', 'fecha', 'validador')
    list_filter = ('fecha', 'validador', 'project', 'estado_validacion')
    search_fields = ('student__user__email', 'project__title', 'descripcion')

admin.site.register(WorkHour, WorkHourAdmin)
