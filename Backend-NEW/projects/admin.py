from django.contrib import admin
from .models import Proyecto, AplicacionProyecto, MiembroProyecto

@admin.register(Proyecto)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'status', 'created_at')
    search_fields = ('title', 'company__company_name')
    list_filter = ('status', 'company')
    ordering = ('-created_at',)

admin.site.register(AplicacionProyecto)
admin.site.register(MiembroProyecto)
