from django.contrib import admin
from .models import Questionnaire, Question, Choice, Answer

class QuestionnaireAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'description')

class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'questionnaire', 'question_type')
    list_filter = ('question_type', 'questionnaire')
    search_fields = ('text',)

class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('text', 'question')
    search_fields = ('text', 'question__text')

class AnswerAdmin(admin.ModelAdmin):
    list_display = ('user', 'question', 'answer_text')
    list_filter = ('question__questionnaire',)
    search_fields = ('user__email', 'question__text', 'answer_text')

admin.site.register(Questionnaire, QuestionnaireAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Choice, ChoiceAdmin)
admin.site.register(Answer, AnswerAdmin)
