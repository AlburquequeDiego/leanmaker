from django.db import models
from django.conf import settings
from students.models import Estudiante
from projects.models import Proyecto


class Questionnaire(models.Model):
    """Modelo para cuestionarios"""
    
    title = models.CharField(max_length=200, verbose_name='Título')
    description = models.TextField(verbose_name='Descripción')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    
    class Meta:
        db_table = 'questionnaires_questionnaire'
        verbose_name = 'Cuestionario'
        verbose_name_plural = 'Cuestionarios'
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title


class Question(models.Model):
    """Modelo para preguntas de cuestionarios"""
    
    QUESTION_TYPES = [
        ('text', 'Texto'),
        ('number', 'Número'),
        ('select', 'Selección única'),
        ('multiselect', 'Selección múltiple'),
        ('boolean', 'Sí/No'),
    ]
    
    questionnaire = models.ForeignKey(
        Questionnaire, 
        on_delete=models.CASCADE, 
        related_name='questions',
        verbose_name='Cuestionario'
    )
    text = models.TextField(verbose_name='Pregunta')
    question_type = models.CharField(
        max_length=20, 
        choices=QUESTION_TYPES, 
        default='text',
        verbose_name='Tipo de pregunta'
    )
    required = models.BooleanField(default=True, verbose_name='Obligatoria')
    order = models.IntegerField(default=0, verbose_name='Orden')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    
    class Meta:
        db_table = 'questionnaires_question'
        verbose_name = 'Pregunta'
        verbose_name_plural = 'Preguntas'
        ordering = ['order', 'created_at']
        
    def __str__(self):
        return f"{self.questionnaire.title} - {self.text[:50]}"


class QuestionOption(models.Model):
    """Modelo para opciones de preguntas de selección"""
    
    question = models.ForeignKey(
        Question, 
        on_delete=models.CASCADE, 
        related_name='options',
        verbose_name='Pregunta'
    )
    text = models.CharField(max_length=200, verbose_name='Opción')
    order = models.IntegerField(default=0, verbose_name='Orden')
    
    class Meta:
        db_table = 'questionnaires_questionoption'
        verbose_name = 'Opción de pregunta'
        verbose_name_plural = 'Opciones de pregunta'
        ordering = ['order']
        
    def __str__(self):
        return f"{self.question.text[:30]} - {self.text}"


class QuestionnaireResponse(models.Model):
    """Modelo para respuestas de cuestionarios"""
    
    questionnaire = models.ForeignKey(
        Questionnaire, 
        on_delete=models.CASCADE, 
        related_name='responses',
        verbose_name='Cuestionario'
    )
    student = models.ForeignKey(
        Estudiante, 
        on_delete=models.CASCADE, 
        related_name='questionnaire_responses',
        verbose_name='Estudiante'
    )
    project = models.ForeignKey(
        Proyecto, 
        on_delete=models.CASCADE, 
        related_name='questionnaire_responses',
        verbose_name='Proyecto'
    )
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de envío')
    
    class Meta:
        db_table = 'questionnaires_questionnaireresponse'
        verbose_name = 'Respuesta de cuestionario'
        verbose_name_plural = 'Respuestas de cuestionarios'
        ordering = ['-submitted_at']
        
    def __str__(self):
        return f"{self.student} - {self.questionnaire.title} - {self.submitted_at.date()}"


class QuestionResponse(models.Model):
    """Modelo para respuestas individuales a preguntas"""
    
    questionnaire_response = models.ForeignKey(
        QuestionnaireResponse, 
        on_delete=models.CASCADE, 
        related_name='question_responses',
        verbose_name='Respuesta de cuestionario'
    )
    question = models.ForeignKey(
        Question, 
        on_delete=models.CASCADE, 
        related_name='responses',
        verbose_name='Pregunta'
    )
    text_response = models.TextField(blank=True, null=True, verbose_name='Respuesta de texto')
    number_response = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True, 
        verbose_name='Respuesta numérica'
    )
    boolean_response = models.BooleanField(blank=True, null=True, verbose_name='Respuesta booleana')
    selected_options = models.ManyToManyField(
        QuestionOption, 
        blank=True, 
        verbose_name='Opciones seleccionadas'
    )
    
    class Meta:
        db_table = 'questionnaires_questionresponse'
        verbose_name = 'Respuesta de pregunta'
        verbose_name_plural = 'Respuestas de preguntas'
        
    def __str__(self):
        return f"{self.questionnaire_response} - {self.question.text[:30]}" 