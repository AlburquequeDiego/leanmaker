from django.contrib import admin
from .models import Estudiante, PerfilEstudiante
from evaluations.models import StudentSkill

@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    list_display = ('user_full_name', 'career', 'university', 'gpa_display', 'api_level', 'trl_level', 'total_evaluaciones')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'career', 'university')
    list_filter = ('status', 'api_level', 'trl_level', 'availability', 'created_at')
    ordering = ('user__first_name', 'user__last_name')
    
    readonly_fields = ('gpa', 'completed_projects', 'total_hours', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('user', 'career', 'semester', 'university', 'education_level')
        }),
        ('Estado y Niveles', {
            'fields': ('status', 'api_level', 'api_level_approved_by_admin', 'trl_level', 'strikes')
        }),
        ('Métricas y Evaluaciones', {
            'fields': ('gpa', 'completed_projects', 'total_hours', 'experience_years')
        }),
        ('Disponibilidad', {
            'fields': ('availability', 'hours_per_week', 'location', 'area')
        }),
        ('Enlaces', {
            'fields': ('portfolio_url', 'github_url', 'linkedin_url', 'cv_link', 'certificado_link'),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_full_name(self, obj):
        return obj.user.full_name if obj.user else 'Sin usuario'
    user_full_name.short_description = 'Nombre Completo'
    
    def gpa_display(self, obj):
        """Muestra el GPA con color y información adicional"""
        if obj.gpa == 0:
            return f"0.00 📊 (Sin evaluaciones)"
        elif obj.gpa >= 4.5:
            return f"{obj.gpa} 📊⭐⭐⭐⭐⭐ (Excelente)"
        elif obj.gpa >= 4.0:
            return f"{obj.gpa} 📊⭐⭐⭐⭐ (Muy bueno)"
        elif obj.gpa >= 3.0:
            return f"{obj.gpa} 📊⭐⭐⭐ (Bueno)"
        else:
            return f"{obj.gpa} 📊⭐⭐ (Regular)"
    gpa_display.short_description = 'GPA'
    
    def total_evaluaciones(self, obj):
        """Muestra el total de evaluaciones recibidas"""
        from evaluations.models import Evaluation
        count = Evaluation.objects.filter(
            student=obj,
            status='completed',
            evaluation_type='company_to_student'
        ).count()
        return f"{count} evaluaciones"
    total_evaluaciones.short_description = 'Evaluaciones'
    
    def get_queryset(self, request):
        """Optimiza las consultas incluyendo información relacionada"""
        return super().get_queryset(request).select_related('user')
    
    actions = ['recalcular_gpas', 'ver_estadisticas', 'proteger_api_levels']
    
    def recalcular_gpas(self, request, queryset):
        """Acción para recalcular GPAs de estudiantes seleccionados"""
        count = 0
        for estudiante in queryset:
            try:
                gpa_anterior = estudiante.gpa
                estudiante.actualizar_calificacion()
                estudiante.refresh_from_db()
                if gpa_anterior != estudiante.gpa:
                    count += 1
                    self.message_user(
                        request, 
                        f"GPA de {estudiante.user.full_name} actualizado: {gpa_anterior} → {estudiante.gpa}"
                    )
            except Exception as e:
                self.message_user(
                    request, 
                    f"Error actualizando {estudiante.user.full_name}: {e}",
                    level='ERROR'
                )
        
        if count > 0:
            self.message_user(request, f"✅ {count} GPAs actualizados exitosamente")
        else:
            self.message_user(request, "ℹ️ No se encontraron GPAs para actualizar")
    
    recalcular_gpas.short_description = "Recalcular GPAs seleccionados"
    
    def ver_estadisticas(self, request, queryset):
        """Acción para ver estadísticas de evaluaciones"""
        if queryset.count() != 1:
            self.message_user(request, "⚠️ Selecciona solo un estudiante para ver estadísticas")
            return
        
        estudiante = queryset.first()
        stats = estudiante.obtener_estadisticas_evaluaciones()
        
        mensaje = f"📊 Estadísticas de {estudiante.user.full_name}:\n"
        mensaje += f"Total evaluaciones: {stats['total_evaluaciones']}\n"
        mensaje += f"Promedio: {stats['promedio']}\n"
        mensaje += f"Rango: {stats['puntuacion_minima']} - {stats['puntuacion_maxima']}\n"
        
        if stats['distribucion']:
            mensaje += "Distribución:\n"
            for key, value in stats['distribucion'].items():
                mensaje += f"  {key}: {value}\n"
        
        self.message_user(request, mensaje)
    
    ver_estadisticas.short_description = "Ver estadísticas de evaluaciones"
    
    def proteger_api_levels(self, request, queryset):
        """Acción para proteger niveles de API de estudiantes seleccionados"""
        count = 0
        for estudiante in queryset:
            try:
                if estudiante.api_level > 1:
                    estudiante.proteger_api_level()
                    count += 1
                    self.message_user(
                        request, 
                        f"API Level de {estudiante.user.full_name} protegido (Nivel {estudiante.api_level})"
                    )
            except Exception as e:
                self.message_user(
                    request, 
                    f"Error protegiendo {estudiante.user.full_name}: {e}",
                    level='ERROR'
                )
        
        if count > 0:
            self.message_user(request, f"✅ {count} niveles de API protegidos exitosamente")
        else:
            self.message_user(request, "ℹ️ No se encontraron niveles de API para proteger")
    
    proteger_api_levels.short_description = "Proteger niveles de API seleccionados"

@admin.register(PerfilEstudiante)
class PerfilEstudianteAdmin(admin.ModelAdmin):
    list_display = ('estudiante', 'fecha_nacimiento', 'genero', 'nacionalidad')
    search_fields = ('estudiante__user__first_name', 'estudiante__user__last_name')
    list_filter = ('genero', 'nacionalidad')
    ordering = ('estudiante__user__first_name',)

@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ('student', 'skill_name', 'level', 'years_experience', 'is_verified')
    list_filter = ('level', 'is_verified', 'created_at')
    search_fields = ('skill_name', 'student__user__first_name', 'student__user__last_name')
    ordering = ('student__user__first_name', 'skill_name')

# @admin.register(APILevelRequest)
# class APILevelRequestAdmin(admin.ModelAdmin):
#     list_display = ('student', 'requested_level', 'current_level', 'status', 'submitted_at')
#     list_filter = ('status', 'requested_level', 'submitted_at')
#     search_fields = ('student__user__first_name', 'student__user__last_name')
#     ordering = ('-submitted_at',)
#     
#     readonly_fields = ('submitted_at',)
#     
#     def get_queryset(self, request):
#         return super().get_queryset(request).select_related('student__user')
