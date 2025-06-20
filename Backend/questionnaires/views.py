from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Questionnaire, Question, Answer
from .serializers import (
    QuestionnaireSerializer, 
    AnswerSerializer, 
    QuestionnaireResponseSerializer
)

# Create your views here.

class QuestionnaireViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para Cuestionarios.
    - Solo lectura para usuarios normales.
    - Los admins pueden crear/editar vía admin panel.
    """
    queryset = Questionnaire.objects.all()
    serializer_class = QuestionnaireSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def submit_responses(self, request, pk=None):
        """
        Endpoint para enviar respuestas completas a un cuestionario.
        """
        questionnaire = self.get_object()
        serializer = QuestionnaireResponseSerializer(data=request.data)
        
        if serializer.is_valid():
            answers_data = serializer.validated_data['answers']
            user = request.user
            
            # Procesar cada respuesta
            for answer_data in answers_data:
                question_id = answer_data.get('question_id')
                question = get_object_or_404(Question, id=question_id, questionnaire=questionnaire)
                
                # Crear o actualizar la respuesta
                answer, created = Answer.objects.get_or_create(
                    user=user,
                    question=question,
                    defaults={
                        'answer_text': answer_data.get('answer_text', ''),
                    }
                )
                
                if not created:
                    # Actualizar respuesta existente
                    answer.answer_text = answer_data.get('answer_text', '')
                    answer.save()
                
                # Manejar opciones seleccionadas
                if 'selected_choices' in answer_data:
                    answer.selected_choices.clear()
                    for choice_id in answer_data['selected_choices']:
                        choice = question.choices.filter(id=choice_id).first()
                        if choice:
                            answer.selected_choices.add(choice)
            
            return Response({'message': 'Respuestas enviadas correctamente'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AnswerViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Respuestas individuales.
    - Los usuarios pueden crear y ver sus propias respuestas.
    - No pueden modificar respuestas existentes.
    """
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Los usuarios solo ven sus propias respuestas.
        """
        return Answer.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Asigna automáticamente el usuario actual.
        """
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        No permitir actualizaciones de respuestas existentes.
        """
        return Response(
            {'error': 'No se pueden modificar respuestas existentes'}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def partial_update(self, request, *args, **kwargs):
        """
        No permitir actualizaciones parciales.
        """
        return Response(
            {'error': 'No se pueden modificar respuestas existentes'}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
