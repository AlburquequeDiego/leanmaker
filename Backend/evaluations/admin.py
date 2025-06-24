from django.contrib import admin
from .models import Evaluation

class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('project', 'student', 'evaluator', 'category', 'rating')
    list_filter = ('category', 'rating', 'created_at')
    search_fields = ('project__title', 'student__email', 'evaluator__email')

admin.site.register(Evaluation, EvaluationAdmin)
