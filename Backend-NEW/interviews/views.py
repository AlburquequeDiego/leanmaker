from django.shortcuts import render
, permissions, filters


from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Interview
# from .models import InterviewQuestion, InterviewResponse  # No existen en models.py
from .serializers import (
    InterviewSerializer, InterviewDetailSerializer, InterviewCreateSerializer,
    InterviewUpdateSerializer, InterviewStatsSerializer
)

class InterviewViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de entrevistas"""
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['interviewer', 'application_id', 'status', 'interview_type']
    search_fields = ['notes', 'feedback']
    ordering_fields = ['interview_date', 'created_at', 'duration_minutes']
    ordering = ['-interview_date']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        if user.role == 'admin':
            return Interview.objects.all()
        elif user.role == 'company':
            return Interview.objects.filter(interviewer=user)
        else:
            # Los estudiantes ven entrevistas donde son parte de la aplicación
            # Nota: Por ahora no hay relación directa, se puede implementar después
            return Interview.objects.none()

    def get_serializer_class(self):
        """Retornar serializer específico según la acción"""
        if self.action == 'create':
            return InterviewCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return InterviewUpdateSerializer
        elif self.action == 'retrieve':
            return InterviewDetailSerializer
        return InterviewSerializer

    def perform_create(self, serializer):
        """Asignar el entrevistador al crear la entrevista"""
        serializer.save(interviewer=self.request.user)

    @action(detail=False, methods=['get'])
    def my_interviews(self, request):
        """Entrevistas del usuario actual"""
        if request.user.role == 'company':
            queryset = Interview.objects.filter(interviewer=request.user)
        else:
            # Nota: Por ahora no hay relación directa, se puede implementar después
            queryset = Interview.objects.none()
        serializer = InterviewSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Entrevistas próximas"""
        now = timezone.now()
        if request.user.role == 'company':
            queryset = Interview.objects.filter(
                interviewer=request.user,
                interview_date__gte=now,
                status='scheduled'
            )
        else:
            # Nota: Por ahora no hay relación directa, se puede implementar después
            queryset = Interview.objects.none()
        serializer = InterviewSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Entrevistas de hoy"""
        today = timezone.now().date()
        if request.user.role == 'company':
            queryset = Interview.objects.filter(
                interviewer=request.user,
                interview_date__date=today
            )
        else:
            # Nota: Por ahora no hay relación directa, se puede implementar después
            queryset = Interview.objects.none()
        serializer = InterviewSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def this_week(self, request):
        """Entrevistas de esta semana"""
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=7)
        if request.user.role == 'company':
            queryset = Interview.objects.filter(
                interviewer=request.user,
                interview_date__date__gte=week_start,
                interview_date__date__lt=week_end
            )
        else:
            # Nota: Por ahora no hay relación directa, se puede implementar después
            queryset = Interview.objects.none()
        serializer = InterviewSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def schedule(self, request, pk=None):
        """Programar entrevista"""
        interview = self.get_object()
        
        if interview.interviewer != request.user:
            return Response(
                {"error": "Solo el entrevistador puede programar la entrevista"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        scheduled_at = request.data.get('scheduled_at')
        duration = request.data.get('duration', 60)
        
        if not scheduled_at:
            return Response(
                {"error": "Se requiere scheduled_at"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            interview.scheduled_at = datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
            interview.duration = duration
            interview.status = 'scheduled'
            interview.save()
        except ValueError:
            return Response(
                {"error": "Formato de fecha/hora inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({"message": "Entrevista programada correctamente"})

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Iniciar entrevista"""
        interview = self.get_object()
        
        if interview.interviewer != request.user:
            return Response(
                {"error": "Solo el entrevistador puede iniciar la entrevista"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if interview.status != 'scheduled':
            return Response(
                {"error": "Solo se pueden iniciar entrevistas programadas"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        interview.status = 'in_progress'
        interview.started_at = timezone.now()
        interview.save()
        
        return Response({"message": "Entrevista iniciada correctamente"})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Completar entrevista"""
        interview = self.get_object()
        
        if interview.interviewer != request.user:
            return Response(
                {"error": "Solo el entrevistador puede completar la entrevista"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if interview.status != 'in_progress':
            return Response(
                {"error": "Solo se pueden completar entrevistas en progreso"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        interview.status = 'completed'
        interview.completed_at = timezone.now()
        interview.save()
        
        return Response({"message": "Entrevista completada correctamente"})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancelar entrevista"""
        interview = self.get_object()
        
        if interview.interviewer != request.user and interview.interviewee != request.user:
            return Response(
                {"error": "Solo los participantes pueden cancelar la entrevista"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if interview.status not in ['scheduled', 'in_progress']:
            return Response(
                {"error": "Solo se pueden cancelar entrevistas programadas o en progreso"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        interview.status = 'cancelled'
        interview.cancelled_at = timezone.now()
        interview.cancelled_by = request.user
        interview.save()
        
        return Response({"message": "Entrevista cancelada correctamente"})

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Reprogramar entrevista"""
        interview = self.get_object()
        
        if interview.interviewer != request.user:
            return Response(
                {"error": "Solo el entrevistador puede reprogramar la entrevista"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_scheduled_at = request.data.get('new_scheduled_at')
        new_duration = request.data.get('new_duration')
        
        if not new_scheduled_at:
            return Response(
                {"error": "Se requiere new_scheduled_at"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            interview.scheduled_at = datetime.fromisoformat(new_scheduled_at.replace('Z', '+00:00'))
            if new_duration:
                interview.duration = new_duration
            interview.status = 'scheduled'
            interview.save()
        except ValueError:
            return Response(
                {"error": "Formato de fecha/hora inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({"message": "Entrevista reprogramada correctamente"})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de entrevistas"""
        if request.user.role == 'admin':
            # Estadísticas generales
            stats = {
                'total_interviews': Interview.objects.count(),
                'scheduled_interviews': Interview.objects.filter(status='scheduled').count(),
                'completed_interviews': Interview.objects.filter(status='completed').count(),
                'cancelled_interviews': Interview.objects.filter(status='cancelled').count(),
                'interviews_by_type': Interview.objects.values('interview_type').annotate(count=Count('id')),
                'interviews_today': Interview.objects.filter(
                    interview_date__date=timezone.now().date()
                ).count(),
            }
        elif request.user.role == 'company':
            # Estadísticas de la empresa
            company_interviews = Interview.objects.filter(interviewer=request.user)
            stats = {
                'total_interviews': company_interviews.count(),
                'scheduled_interviews': company_interviews.filter(status='scheduled').count(),
                'completed_interviews': company_interviews.filter(status='completed').count(),
                'cancelled_interviews': company_interviews.filter(status='cancelled').count(),
                'interviews_today': company_interviews.filter(
                    interview_date__date=timezone.now().date()
                ).count(),
                'upcoming_interviews': company_interviews.filter(
                    interview_date__gte=timezone.now(),
                    status='scheduled'
                ).count(),
            }
        else:
            # Estadísticas del estudiante
            student_interviews = Interview.objects.filter(application__student__user=request.user)
            stats = {
                'total_interviews': student_interviews.count(),
                'scheduled_interviews': student_interviews.filter(status='scheduled').count(),
                'completed_interviews': student_interviews.filter(status='completed').count(),
                'cancelled_interviews': student_interviews.filter(status='cancelled').count(),
                'interviews_today': student_interviews.filter(
                    interview_date__date=timezone.now().date()
                ).count(),
                'upcoming_interviews': student_interviews.filter(
                    interview_date__gte=timezone.now(),
                    status='scheduled'
                ).count(),
            }
        
        return Response(stats)

# class InterviewQuestionViewSet(viewsets.ModelViewSet):
#     """ViewSet para gestión de preguntas de entrevista"""
#     queryset = InterviewQuestion.objects.all()
#     serializer_class = InterviewQuestionSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_fields = ['interview', 'question_type', 'is_required']
#     search_fields = ['text', 'description']
#     ordering_fields = ['order', 'created_at']
#     ordering = ['order']

# class InterviewResponseViewSet(viewsets.ModelViewSet):
#     """ViewSet para gestión de respuestas de entrevista"""
#     queryset = InterviewResponse.objects.all()
#     serializer_class = InterviewResponseSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_fields = ['interview', 'question', 'respondent']
#     ordering_fields = ['created_at']
#     ordering = ['-created_at']
