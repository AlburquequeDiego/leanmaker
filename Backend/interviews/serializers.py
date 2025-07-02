from rest_framework import serializers
from .models import Interview
# from .models import InterviewQuestion, InterviewResponse, InterviewSchedule  # No existen en models.py
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer, ProjectApplicationSerializer

class InterviewSerializer(serializers.ModelSerializer):
    """Serializer básico para entrevistas"""
    interviewer_name = serializers.CharField(source='interviewer.full_name', read_only=True)
    interviewer_avatar = serializers.CharField(source='interviewer.avatar', read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Interview
        fields = [
            'id', 'application_id', 'interviewer', 'interviewer_name', 'interviewer_avatar',
            'interview_type', 'status', 'interview_date', 'duration_minutes',
            'notes', 'feedback', 'rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class InterviewDetailSerializer(InterviewSerializer):
    """Serializer detallado para entrevistas"""
    interviewer_details = UserSerializer(source='interviewer', read_only=True)
    
    class Meta(InterviewSerializer.Meta):
        fields = InterviewSerializer.Meta.fields + ['interviewer_details']

class InterviewCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear entrevistas"""
    
    class Meta:
        model = Interview
        fields = [
            'application_id', 'interviewer', 'interview_type', 'interview_date',
            'duration_minutes', 'notes', 'feedback', 'status'
        ]
    
    def validate(self, attrs):
        # Verificar que el usuario tenga permisos para crear entrevistas
        user = self.context['request'].user
        if user.role not in ['admin', 'company']:
            raise serializers.ValidationError("Solo administradores y empresas pueden crear entrevistas.")
        
        # Validar que la fecha sea futura
        from django.utils import timezone
        if attrs.get('interview_date') <= timezone.now():
            raise serializers.ValidationError("La fecha de la entrevista debe ser futura.")
        
        # Validar que la duración sea razonable
        duration = attrs.get('duration_minutes', 60)
        if duration <= 0 or duration > 480:  # Máximo 8 horas
            raise serializers.ValidationError("La duración debe estar entre 1 y 480 minutos.")
        
        return attrs
    
    def create(self, validated_data):
        interview = super().create(validated_data)
        return interview

class InterviewUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar entrevistas"""
    
    class Meta:
        model = Interview
        fields = [
            'interview_type', 'interview_date', 'duration_minutes',
            'notes', 'status', 'feedback'
        ]
    
    def validate(self, attrs):
        # Validar que el estado sea válido
        status = attrs.get('status')
        if status and status not in dict(Interview.STATUS_CHOICES):
            raise serializers.ValidationError("Estado de entrevista inválido.")
        
        # Si se está completando la entrevista, verificar que tenga feedback
        if status == 'completed' and not attrs.get('feedback'):
            raise serializers.ValidationError("Debe proporcionar feedback al completar la entrevista.")
        
        return attrs
    
    def update(self, instance, validated_data):
        interview = super().update(instance, validated_data)
        return interview

class InterviewStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de entrevistas"""
    total_interviews = serializers.IntegerField()
    completed_interviews = serializers.IntegerField()
    scheduled_interviews = serializers.IntegerField()
    cancelled_interviews = serializers.IntegerField()
    interviews_by_type = serializers.DictField()
    interviews_by_month = serializers.ListField()
    recent_interviews = InterviewSerializer(many=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas por tipo
        interviews = Interview.objects.all()
        type_stats = {}
        
        for interview_type, _ in Interview.INTERVIEW_TYPE_CHOICES:
            type_interviews = interviews.filter(interview_type=interview_type)
            if type_interviews.exists():
                type_stats[interview_type] = type_interviews.count()
        
        data['interviews_by_type'] = type_stats
        return data

class StudentInterviewSummarySerializer(serializers.Serializer):
    """Serializer para resumen de entrevistas de un estudiante"""
    student = UserSerializer()
    total_interviews = serializers.IntegerField()
    completed_interviews = serializers.IntegerField()
    recent_interviews = InterviewSerializer(many=True)
    upcoming_interviews = InterviewSerializer(many=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Obtener entrevistas recientes
        from django.utils import timezone
        recent_interviews = instance.interviews.filter(
            status='completed'
        ).order_by('-interview_date')[:5]
        data['recent_interviews'] = InterviewSerializer(recent_interviews, many=True).data
        
        # Obtener entrevistas próximas
        upcoming_interviews = instance.interviews.filter(
            status='scheduled',
            interview_date__gte=timezone.now()
        ).order_by('interview_date')[:5]
        data['upcoming_interviews'] = InterviewSerializer(upcoming_interviews, many=True).data
        
        return data

class CompanyInterviewSummarySerializer(serializers.Serializer):
    """Serializer para resumen de entrevistas de una empresa"""
    company = UserSerializer()
    total_interviews_conducted = serializers.IntegerField()
    completed_interviews = serializers.IntegerField()
    interviews_by_project = serializers.DictField()
    recent_interviews = InterviewSerializer(many=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas por proyecto
        interviews = instance.interviews_conducted.all()
        project_stats = {}
        
        for interview in interviews:
            project_id = str(interview.application.project.id)
            if project_id not in project_stats:
                project_stats[project_id] = {
                    'project_title': interview.application.project.title,
                    'total_interviews': 0,
                    'completed_interviews': 0
                }
            
            project_stats[project_id]['total_interviews'] += 1
            if interview.status == 'completed':
                project_stats[project_id]['completed_interviews'] += 1
        
        data['interviews_by_project'] = project_stats
        return data 
