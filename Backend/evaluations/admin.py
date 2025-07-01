from django.contrib import admin
from .models import Evaluation

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('project', 'student', 'company', 'evaluator', 'overall_rating', 'status', 'type', 'date')
    search_fields = ('project__title', 'student__user__first_name', 'student__user__last_name', 'company__company_name')
    list_filter = ('status', 'type', 'company')
    ordering = ('-date',)
