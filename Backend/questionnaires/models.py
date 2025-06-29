from django.db import models
from django.conf import settings

class Questionnaire(models.Model):
    title = models.CharField(max_length=255, verbose_name='Título del Cuestionario')
    description = models.TextField(blank=True, verbose_name='Descripción')
    
    # Podríamos asociar cuestionarios a proyectos o hacerlos generales.
    # Por ahora, los haremos generales y que el admin los asigne.
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'questionnaires'
        verbose_name = 'Cuestionario'
        verbose_name_plural = 'Cuestionarios'

    def __str__(self):
        return self.title

class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('TEXT', 'Texto Abierto'),
        ('MULTIPLE_CHOICE', 'Opción Múltiple'),
        ('SINGLE_CHOICE', 'Opción Única'),
    ]

    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE, related_name='questions', verbose_name='Cuestionario')
    text = models.CharField(max_length=1024, verbose_name='Texto de la Pregunta')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, verbose_name='Tipo de Pregunta')
    
    # Para preguntas de opción múltiple/única, las opciones se guardarán en otro modelo.
    
    class Meta:
        db_table = 'questionnaires_question'
        verbose_name = 'Pregunta'
        verbose_name_plural = 'Preguntas'
        ordering = ['id']

    def __str__(self):
        return self.text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices', verbose_name='Pregunta')
    text = models.CharField(max_length=255, verbose_name='Texto de la Opción')

    class Meta:
        db_table = 'questionnaires_choice'
        verbose_name = 'Opción'
        verbose_name_plural = 'Opciones'

    def __str__(self):
        return f'{self.question.text[:30]}... -> {self.text}'

class Answer(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='answers', verbose_name='Usuario')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers', verbose_name='Pregunta')
    
    # Guardamos la respuesta como texto, incluso si es una elección.
    # Esto simplifica el modelo, pero podríamos normalizarlo más.
    answer_text = models.TextField(blank=True)
    
    # Si la respuesta es una elección (o varias), las guardamos aquí.
    selected_choices = models.ManyToManyField(Choice, blank=True, verbose_name='Opciones Seleccionadas')

    class Meta:
        db_table = 'questionnaires_answer'
        verbose_name = 'Respuesta'
        verbose_name_plural = 'Respuestas'
        unique_together = ('user', 'question') # Un usuario solo puede responder una vez a cada pregunta

    def __str__(self):
        return f'Respuesta de {self.user.email} a {self.question.text[:30]}...'
