from django.contrib import admin
from .models import Empresa, CalificacionEmpresa

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'industry', 'city', 'user_email', 'rating_display', 'total_evaluaciones')
    search_fields = ('company_name', 'industry', 'user__email')
    list_filter = ('industry', 'city', 'verified', 'status')
    ordering = ('company_name',)
    
    readonly_fields = ('rating', 'total_projects', 'projects_completed', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('company_name', 'user', 'description', 'industry', 'size')
        }),
        ('Contacto', {
            'fields': ('contact_email', 'contact_phone', 'website', 'address', 'city', 'country')
        }),
        ('Estado y Métricas', {
            'fields': ('verified', 'status', 'rating', 'total_projects', 'projects_completed', 'total_hours_offered')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_email(self, obj):
        return obj.user.email if obj.user else 'Sin usuario'
    user_email.short_description = 'Email del Usuario'
    
    def rating_display(self, obj):
        """Muestra el rating con color y información adicional"""
        if obj.rating == 0:
            return f"0.00 ⭐ (Sin evaluaciones)"
        elif obj.rating >= 4.5:
            return f"{obj.rating} ⭐⭐⭐⭐⭐ (Excelente)"
        elif obj.rating >= 4.0:
            return f"{obj.rating} ⭐⭐⭐⭐ (Muy bueno)"
        elif obj.rating >= 3.0:
            return f"{obj.rating} ⭐⭐⭐ (Bueno)"
        else:
            return f"{obj.rating} ⭐⭐ (Regular)"
    rating_display.short_description = 'Rating'
    
    def total_evaluaciones(self, obj):
        """Muestra el total de evaluaciones recibidas"""
        from evaluations.models import Evaluation
        count = Evaluation.objects.filter(
            project__company=obj,
            status='completed',
            evaluation_type='student_to_company'
        ).count()
        return f"{count} evaluaciones"
    total_evaluaciones.short_description = 'Evaluaciones'
    
    def get_queryset(self, request):
        """Optimiza las consultas incluyendo información relacionada"""
        return super().get_queryset(request).select_related('user')
    
    actions = ['recalcular_ratings', 'ver_estadisticas']
    
    def recalcular_ratings(self, request, queryset):
        """Acción para recalcular ratings de empresas seleccionadas"""
        count = 0
        for empresa in queryset:
            try:
                rating_anterior = empresa.rating
                empresa.actualizar_calificacion()
                empresa.refresh_from_db()
                if rating_anterior != empresa.rating:
                    count += 1
                    self.message_user(
                        request, 
                        f"Rating de {empresa.company_name} actualizado: {rating_anterior} → {empresa.rating}"
                    )
            except Exception as e:
                self.message_user(
                    request, 
                    f"Error actualizando {empresa.company_name}: {e}",
                    level='ERROR'
                )
        
        if count > 0:
            self.message_user(request, f"✅ {count} ratings actualizados exitosamente")
        else:
            self.message_user(request, "ℹ️ No se encontraron ratings para actualizar")
    
    recalcular_ratings.short_description = "Recalcular ratings seleccionados"
    
    def ver_estadisticas(self, request, queryset):
        """Acción para ver estadísticas de evaluaciones"""
        if queryset.count() != 1:
            self.message_user(request, "⚠️ Selecciona solo una empresa para ver estadísticas")
            return
        
        empresa = queryset.first()
        stats = empresa.obtener_estadisticas_evaluaciones()
        
        mensaje = f"📊 Estadísticas de {empresa.company_name}:\n"
        mensaje += f"Total evaluaciones: {stats['total_evaluaciones']}\n"
        mensaje += f"Promedio: {stats['promedio']}\n"
        mensaje += f"Rango: {stats['puntuacion_minima']} - {stats['puntuacion_maxima']}\n"
        
        if stats['distribucion']:
            mensaje += "Distribución:\n"
            for key, value in stats['distribucion'].items():
                mensaje += f"  {key}: {value}\n"
        
        self.message_user(request, mensaje)
    
    ver_estadisticas.short_description = "Ver estadísticas de evaluaciones"

@admin.register(CalificacionEmpresa)
class CalificacionEmpresaAdmin(admin.ModelAdmin):
    list_display = ('empresa', 'estudiante', 'puntuacion', 'fecha_calificacion')
    list_filter = ('puntuacion', 'fecha_calificacion')
    search_fields = ('empresa__company_name', 'estudiante__user__full_name')
    ordering = ('-fecha_calificacion',)
    
    readonly_fields = ('fecha_calificacion',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('empresa', 'estudiante__user')
