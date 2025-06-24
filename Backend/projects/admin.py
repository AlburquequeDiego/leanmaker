from django.contrib import admin
from .models import Project

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'company')
    search_fields = ('title', 'description', 'company__company_name')

admin.site.register(Project, ProjectAdmin)
