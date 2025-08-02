from django.contrib import admin
from .models import Rating, StudentCompanyRating, CompanyStudentRating, ProjectRating


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['rating_type', 'rating_value', 'created_at']
    list_filter = ['rating_type', 'rating_value', 'created_at']
    search_fields = ['comment']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información básica', {
            'fields': ('rating_type', 'rating_value')
        }),
        ('Detalles', {
            'fields': ('comment',),
            'classes': ('collapse',)
        }),
    )


@admin.register(StudentCompanyRating)
class StudentCompanyRatingAdmin(admin.ModelAdmin):
    list_display = ['student', 'company', 'project', 'rating_value', 'created_at']
    list_filter = ['rating__created_at', 'project']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'company__company_name']
    ordering = ['-rating__created_at']
    
    def rating_value(self, obj):
        return obj.rating.rating_value
    rating_value.short_description = 'Calificación'
    
    def created_at(self, obj):
        return obj.rating.created_at
    created_at.short_description = 'Fecha de creación'


@admin.register(CompanyStudentRating)
class CompanyStudentRatingAdmin(admin.ModelAdmin):
    list_display = ['company', 'student', 'project', 'rating_value', 'created_at']
    list_filter = ['rating__created_at', 'project']
    search_fields = ['company__company_name', 'student__user__first_name', 'student__user__last_name']
    ordering = ['-rating__created_at']
    
    def rating_value(self, obj):
        return obj.rating.rating_value
    rating_value.short_description = 'Calificación'
    
    def created_at(self, obj):
        return obj.rating.created_at
    created_at.short_description = 'Fecha de creación'


@admin.register(ProjectRating)
class ProjectRatingAdmin(admin.ModelAdmin):
    list_display = ['project', 'rated_by', 'category', 'rating_value', 'created_at']
    list_filter = ['category', 'rating__created_at', 'project']
    search_fields = ['project__title', 'rated_by__first_name', 'rated_by__last_name']
    ordering = ['-rating__created_at']
    
    def rating_value(self, obj):
        return obj.rating.rating_value
    rating_value.short_description = 'Calificación'
    
    def created_at(self, obj):
        return obj.rating.created_at
    created_at.short_description = 'Fecha de creación' 