from django.contrib import admin
from .models import Questionnaire, Question, Choice, Answer

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 1

class QuestionInline(admin.StackedInline):
    model = Question
    inlines = [ChoiceInline]
    extra = 1
    
@admin.register(Questionnaire)
class QuestionnaireAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'updated_at')
    inlines = [QuestionInline]
    search_fields = ('title', 'description')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'questionnaire', 'question_type')
    list_filter = ('questionnaire', 'question_type')
    inlines = [ChoiceInline]
    search_fields = ('text', 'questionnaire__title')

@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('text', 'question')
    list_filter = ('question__questionnaire',)
    search_fields = ('text', 'question__text')

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('user', 'question', 'answer_text_display')
    list_filter = ('question__questionnaire',)
    search_fields = ('user__email', 'question__text', 'answer_text')
    autocomplete_fields = ('user', 'question', 'selected_choices')

    def answer_text_display(self, obj):
        if obj.answer_text:
            return obj.answer_text[:50] + '...' if len(obj.answer_text) > 50 else obj.answer_text
        choices = ", ".join([choice.text for choice in obj.selected_choices.all()])
        return choices if choices else "N/A"
    answer_text_display.short_description = "Respuesta"
