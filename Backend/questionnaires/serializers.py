"""
Serializers para la app questionnaires.
"""

import json
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import Questionnaire, Question, Choice, Answer
from users.models import User

class ChoiceSerializer:
    """Serializer para el modelo Choice"""
    
    @staticmethod
    def to_dict(choice):
        """Convierte un objeto Choice a diccionario"""
        return {
            'id': str(choice.id),
            'text': choice.text
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la opción"""
        errors = {}
        
        if 'text' not in data or not data['text']:
            errors['text'] = 'El texto de la opción es requerido'
        elif len(data['text'].strip()) < 1:
            errors['text'] = 'El texto de la opción no puede estar vacío'
        else:
            data['text'] = data['text'].strip()
        
        return errors
    
    @staticmethod
    def create(data, question):
        """Crea una nueva opción"""
        choice = Choice.objects.create(
            question=question,
            text=data['text']
        )
        
        return choice
    
    @staticmethod
    def update(choice, data):
        """Actualiza una opción existente"""
        if 'text' in data:
            choice.text = data['text']
            choice.save()
        
        return choice

class QuestionSerializer:
    """Serializer para el modelo Question"""
    
    @staticmethod
    def to_dict(question):
        """Convierte un objeto Question a diccionario"""
        return {
            'id': str(question.id),
            'questionnaire_id': str(question.questionnaire.id),
            'text': question.text,
            'question_type': question.question_type,
            'choices': [ChoiceSerializer.to_dict(choice) for choice in question.choices.all()]
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la pregunta"""
        errors = {}
        
        # Validar campos requeridos
        if 'text' not in data or not data['text']:
            errors['text'] = 'El texto de la pregunta es requerido'
        elif len(data['text'].strip()) < 5:
            errors['text'] = 'La pregunta debe tener al menos 5 caracteres'
        else:
            data['text'] = data['text'].strip()
        
        # Validar question_type
        if 'question_type' in data:
            valid_types = [choice[0] for choice in Question.QUESTION_TYPE_CHOICES]
            if data['question_type'] not in valid_types:
                errors['question_type'] = 'Tipo de pregunta no válido'
        
        # Validar choices si se proporcionan
        if 'choices' in data and data['choices']:
            for i, choice_data in enumerate(data['choices']):
                choice_errors = ChoiceSerializer.validate_data(choice_data)
                if choice_errors:
                    errors[f'choices[{i}]'] = choice_errors
        
        return errors
    
    @staticmethod
    def create(data, questionnaire):
        """Crea una nueva pregunta"""
        with transaction.atomic():
            choices_data = data.pop('choices', [])
            
            question = Question.objects.create(
                questionnaire=questionnaire,
                text=data['text'],
                question_type=data.get('question_type', 'TEXT')
            )
            
            # Crear opciones si se proporcionan
            for choice_data in choices_data:
                ChoiceSerializer.create(choice_data, question)
            
            return question
    
    @staticmethod
    def update(question, data):
        """Actualiza una pregunta existente"""
        with transaction.atomic():
            choices_data = data.pop('choices', None)
            
            # Actualizar campos básicos
            if 'text' in data:
                question.text = data['text']
            if 'question_type' in data:
                question.question_type = data['question_type']
            
            question.save()
            
            # Actualizar opciones si se proporcionan
            if choices_data is not None:
                question.choices.all().delete()
                for choice_data in choices_data:
                    ChoiceSerializer.create(choice_data, question)
            
            return question

class QuestionnaireSerializer:
    """Serializer para el modelo Questionnaire"""
    
    @staticmethod
    def to_dict(questionnaire):
        """Convierte un objeto Questionnaire a diccionario"""
        return {
            'id': str(questionnaire.id),
            'title': questionnaire.title,
            'description': questionnaire.description,
            'questions_count': questionnaire.questions.count(),
            'questions': [QuestionSerializer.to_dict(question) for question in questionnaire.questions.all()],
            'created_at': questionnaire.created_at.isoformat(),
            'updated_at': questionnaire.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos del cuestionario"""
        errors = {}
        
        # Validar campos requeridos
        if 'title' not in data or not data['title']:
            errors['title'] = 'El título es requerido'
        elif len(data['title'].strip()) < 3:
            errors['title'] = 'El título debe tener al menos 3 caracteres'
        else:
            data['title'] = data['title'].strip()
        
        # Validar descripción
        if 'description' in data and data['description']:
            if len(data['description'].strip()) < 10:
                errors['description'] = 'La descripción debe tener al menos 10 caracteres'
            else:
                data['description'] = data['description'].strip()
        
        # Validar preguntas si se proporcionan
        if 'questions' in data and data['questions']:
            for i, question_data in enumerate(data['questions']):
                question_errors = QuestionSerializer.validate_data(question_data)
                if question_errors:
                    errors[f'questions[{i}]'] = question_errors
        
        return errors
    
    @staticmethod
    def create(data):
        """Crea un nuevo cuestionario"""
        with transaction.atomic():
            questions_data = data.pop('questions', [])
            
            questionnaire = Questionnaire.objects.create(
                title=data['title'],
                description=data.get('description', '')
            )
            
            # Crear preguntas si se proporcionan
            for question_data in questions_data:
                QuestionSerializer.create(question_data, questionnaire)
            
            return questionnaire
    
    @staticmethod
    def update(questionnaire, data):
        """Actualiza un cuestionario existente"""
        with transaction.atomic():
            questions_data = data.pop('questions', None)
            
            # Actualizar campos básicos
            if 'title' in data:
                questionnaire.title = data['title']
            if 'description' in data:
                questionnaire.description = data['description']
            
            questionnaire.save()
            
            # Actualizar preguntas si se proporcionan
            if questions_data is not None:
                questionnaire.questions.all().delete()
                for question_data in questions_data:
                    QuestionSerializer.create(question_data, questionnaire)
            
            return questionnaire

class AnswerSerializer:
    """Serializer para el modelo Answer"""
    
    @staticmethod
    def to_dict(answer):
        """Convierte un objeto Answer a diccionario"""
        return {
            'id': str(answer.id),
            'user_id': str(answer.user.id),
            'user_name': answer.user.full_name,
            'question_id': str(answer.question.id),
            'question_text': answer.question.text,
            'answer_text': answer.answer_text,
            'selected_choices': [ChoiceSerializer.to_dict(choice) for choice in answer.selected_choices.all()],
            'created_at': answer.created_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la respuesta"""
        errors = {}
        
        # Validar question_id
        if 'question_id' not in data:
            errors['question_id'] = 'El ID de la pregunta es requerido'
        else:
            try:
                question = Question.objects.get(id=data['question_id'])
                data['question'] = question
            except Question.DoesNotExist:
                errors['question_id'] = 'Pregunta no encontrada'
            except Exception as e:
                errors['question_id'] = f'Error al validar la pregunta: {str(e)}'
        
        # Validar respuesta según el tipo de pregunta
        if 'question' in data:
            question = data['question']
            selected_choice_ids = data.get('selected_choice_ids', [])
            answer_text = data.get('answer_text', '').strip()
            
            # Validar que se proporcione al menos una respuesta
            if not answer_text and not selected_choice_ids:
                errors['answer'] = 'Debe proporcionar una respuesta de texto o seleccionar opciones'
            
            # Validar opciones seleccionadas
            if selected_choice_ids:
                valid_choice_ids = list(question.choices.values_list('id', flat=True))
                invalid_choices = set(selected_choice_ids) - set(valid_choice_ids)
                if invalid_choices:
                    errors['selected_choice_ids'] = f'Opciones inválidas: {invalid_choices}'
                
                # Validar según el tipo de pregunta
                if question.question_type == 'SINGLE_CHOICE' and len(selected_choice_ids) > 1:
                    errors['selected_choice_ids'] = 'Solo puede seleccionar una opción para preguntas de opción única'
                
                if question.question_type in ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'] and not selected_choice_ids:
                    errors['selected_choice_ids'] = 'Debe seleccionar al menos una opción para este tipo de pregunta'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea una nueva respuesta"""
        with transaction.atomic():
            selected_choice_ids = data.pop('selected_choice_ids', [])
            
            answer = Answer.objects.create(
                user=user,
                question=data['question'],
                answer_text=data.get('answer_text', '')
            )
            
            # Asignar opciones seleccionadas
            if selected_choice_ids:
                choices = Choice.objects.filter(id__in=selected_choice_ids)
                answer.selected_choices.set(choices)
            
            return answer
    
    @staticmethod
    def update(answer, data):
        """Actualiza una respuesta existente"""
        with transaction.atomic():
            selected_choice_ids = data.pop('selected_choice_ids', None)
            
            # Actualizar campos básicos
            if 'answer_text' in data:
                answer.answer_text = data['answer_text']
            
            answer.save()
            
            # Actualizar opciones seleccionadas si se proporcionan
            if selected_choice_ids is not None:
                choices = Choice.objects.filter(id__in=selected_choice_ids)
                answer.selected_choices.set(choices)
            
            return answer 