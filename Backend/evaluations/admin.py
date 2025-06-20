from django.contrib import admin
from .models import Evaluation

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('project', 'evaluator_type', 'evaluated_entity', 'rating', 'created_at')
    list_filter = ('evaluator_type', 'rating', 'created_at')
    search_fields = ('project__title', 'comment')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    def evaluated_entity(self, obj):
        if obj.evaluated_student:
            return f"Estudiante: {obj.evaluated_student}"
        if obj.evaluated_company:
            return f"Empresa: {obj.evaluated_company}"
        return "N/A"
    evaluated_entity.short_description = 'Entidad Evaluada'
