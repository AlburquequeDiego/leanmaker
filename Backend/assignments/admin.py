from django.contrib import admin
from .models import Assignment, AssignmentRole, AssignmentMilestone


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'project', 'status', 'assigned_date', 'assigned_by']
    list_filter = ['status', 'assigned_date', 'project']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'project__title']
    date_hierarchy = 'assigned_date'
    ordering = ['-assigned_date']
    
    fieldsets = (
        ('Información básica', {
            'fields': ('student', 'project', 'assigned_by', 'status')
        }),
        ('Fechas', {
            'fields': ('start_date', 'end_date'),
            'classes': ('collapse',)
        }),
        ('Detalles', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )


@admin.register(AssignmentRole)
class AssignmentRoleAdmin(admin.ModelAdmin):
    list_display = ['assignment', 'role_name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['role_name', 'assignment__student__user__first_name']
    ordering = ['-created_at']


@admin.register(AssignmentMilestone)
class AssignmentMilestoneAdmin(admin.ModelAdmin):
    list_display = ['assignment', 'title', 'due_date', 'status', 'completed_date']
    list_filter = ['status', 'due_date', 'completed_date']
    search_fields = ['title', 'assignment__student__user__first_name']
    date_hierarchy = 'due_date'
    ordering = ['due_date'] 