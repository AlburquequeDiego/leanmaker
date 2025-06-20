from rest_framework import serializers
from .models import Questionnaire, Question, Choice, Answer

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'choices']

class QuestionnaireSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Questionnaire
        fields = ['id', 'title', 'description', 'questions', 'created_at', 'updated_at']

class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    selected_choices_text = serializers.SerializerMethodField()
    
    class Meta:
        model = Answer
        fields = ['id', 'question', 'question_text', 'question_type', 'answer_text', 'selected_choices', 'selected_choices_text']
        read_only_fields = ['id', 'question_text', 'question_type', 'selected_choices_text']
    
    def get_selected_choices_text(self, obj):
        return [choice.text for choice in obj.selected_choices.all()]
    
    def validate(self, data):
        """
        Valida que la respuesta sea apropiada para el tipo de pregunta.
        """
        question = data.get('question')
        answer_text = data.get('answer_text', '')
        selected_choices = data.get('selected_choices', [])
        
        if question.question_type == 'TEXT':
            if not answer_text.strip():
                raise serializers.ValidationError("Las preguntas de texto requieren una respuesta.")
            if selected_choices:
                raise serializers.ValidationError("Las preguntas de texto no pueden tener opciones seleccionadas.")
        
        elif question.question_type in ['SINGLE_CHOICE', 'MULTIPLE_CHOICE']:
            if not selected_choices:
                raise serializers.ValidationError("Las preguntas de opción requieren al menos una opción seleccionada.")
            if question.question_type == 'SINGLE_CHOICE' and len(selected_choices) > 1:
                raise serializers.ValidationError("Las preguntas de opción única solo pueden tener una opción seleccionada.")
        
        return data

class QuestionnaireResponseSerializer(serializers.Serializer):
    """
    Serializer para enviar respuestas a un cuestionario completo.
    """
    questionnaire_id = serializers.IntegerField()
    answers = serializers.ListField(
        child=serializers.DictField(),
        help_text="Lista de respuestas con formato: [{'question_id': 1, 'answer_text': 'respuesta'}, ...]"
    ) 