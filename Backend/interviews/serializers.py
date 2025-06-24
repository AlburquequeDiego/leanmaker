from rest_framework import serializers
from .models import Interview, InterviewQuestion, InterviewResponse, InterviewSchedule
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer, ProjectApplicationSerializer

class InterviewSerializer(serializers.ModelSerializer):
    """Serializer básico para entrevistas"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_avatar = serializers.CharField(source='student.avatar', read_only=True)
    interviewer_name = serializers.CharField(source='interviewer.get_full_name', read_only=True)
    interviewer_avatar = serializers.CharField(source='interviewer.avatar', read_only=True)
    project_title = serializers.CharField(source='application.project.title', read_only=True)
    company_name = serializers.CharField(source='application.project.company.company_name', read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'student', 'student_name', 'student_avatar',
            'interviewer', 'interviewer_name', 'interviewer_avatar', 'project_title',
            'company_name', 'interview_type', 'status', 'scheduled_date', 'duration_minutes',
            'location', 'meeting_url', 'notes', 'feedback', 'rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duration_minutes']

class InterviewDetailSerializer(InterviewSerializer):
    """Serializer detallado para entrevistas"""
    application_details = ProjectApplicationSerializer(source='application', read_only=True)
    student_details = UserSerializer(source='student', read_only=True)
    interviewer_details = UserSerializer(source='interviewer', read_only=True)
    questions = serializers.SerializerMethodField()
    responses = serializers.SerializerMethodField()
    
    class Meta(InterviewSerializer.Meta):
        fields = InterviewSerializer.Meta.fields + ['application_details', 'student_details', 'interviewer_details', 'questions', 'responses']
    
    def get_questions(self, obj):
        questions = obj.questions.all().order_by('order')
        return InterviewQuestionSerializer(questions, many=True).data
    
    def get_responses(self, obj):
        responses = obj.responses.all().order_by('question__order')
        return InterviewResponseSerializer(responses, many=True).data

class InterviewCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear entrevistas"""
    
    class Meta:
        model = Interview
        fields = [
            'application', 'interviewer', 'interview_type', 'scheduled_date',
            'duration_minutes', 'location', 'meeting_url', 'notes'
        ]
    
    def validate(self, attrs):
        # Verificar que el usuario tenga permisos para crear entrevistas
        user = self.context['request'].user
        if user.role not in ['admin', 'company']:
            raise serializers.ValidationError("Solo administradores y empresas pueden crear entrevistas.")
        
        # Si es una empresa, verificar que la aplicación sea de su proyecto
        if user.role == 'company':
            application = attrs.get('application')
            if application.project.company != user:
                raise serializers.ValidationError("Solo puedes crear entrevistas para aplicaciones de tus proyectos.")
        
        # Verificar que la aplicación esté en estado apropiado
        application = attrs.get('application')
        if application.status not in ['pending', 'reviewing']:
            raise serializers.ValidationError("Solo se pueden crear entrevistas para aplicaciones pendientes o en revisión.")
        
        # Verificar que no haya una entrevista programada para la misma aplicación
        if Interview.objects.filter(
            application=application,
            status__in=['scheduled', 'in_progress']
        ).exists():
            raise serializers.ValidationError("Ya existe una entrevista programada para esta aplicación.")
        
        # Validar que la fecha sea futura
        from django.utils import timezone
        if attrs.get('scheduled_date') <= timezone.now():
            raise serializers.ValidationError("La fecha de la entrevista debe ser futura.")
        
        # Validar que la duración sea razonable
        duration = attrs.get('duration_minutes', 60)
        if duration <= 0 or duration > 480:  # Máximo 8 horas
            raise serializers.ValidationError("La duración debe estar entre 1 y 480 minutos.")
        
        return attrs
    
    def create(self, validated_data):
        interview = super().create(validated_data)
        
        # Actualizar el estado de la aplicación
        application = interview.application
        application.status = 'interviewed'
        application.save(update_fields=['status'])
        
        return interview

class InterviewUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar entrevistas"""
    
    class Meta:
        model = Interview
        fields = [
            'interview_type', 'scheduled_date', 'duration_minutes', 'location',
            'meeting_url', 'notes', 'status', 'feedback', 'rating'
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
        old_status = instance.status
        new_status = validated_data.get('status', old_status)
        
        interview = super().update(instance, validated_data)
        
        # Si se completa la entrevista, actualizar la aplicación
        if new_status == 'completed' and old_status != 'completed':
            application = interview.application
            # La aplicación se mantiene en 'interviewed' hasta que se tome una decisión final
            pass
        
        return interview

class InterviewQuestionSerializer(serializers.ModelSerializer):
    """Serializer para preguntas de entrevista"""
    
    class Meta:
        model = InterviewQuestion
        fields = [
            'id', 'interview', 'question_text', 'question_type', 'order',
            'is_required', 'points', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class InterviewQuestionCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear preguntas de entrevista"""
    
    class Meta:
        model = InterviewQuestion
        fields = ['interview', 'question_text', 'question_type', 'order', 'is_required', 'points']
    
    def validate(self, attrs):
        # Verificar que el tipo de pregunta sea válido
        question_type = attrs.get('question_type')
        if question_type not in dict(InterviewQuestion.QUESTION_TYPE_CHOICES):
            raise serializers.ValidationError("Tipo de pregunta inválido.")
        
        return attrs

class InterviewResponseSerializer(serializers.ModelSerializer):
    """Serializer para respuestas de entrevista"""
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    
    class Meta:
        model = InterviewResponse
        fields = [
            'id', 'interview', 'question', 'question_text', 'question_type',
            'response_text', 'response_rating', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class InterviewResponseCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear respuestas de entrevista"""
    
    class Meta:
        model = InterviewResponse
        fields = ['interview', 'question', 'response_text', 'response_rating', 'notes']
    
    def validate(self, attrs):
        interview = attrs.get('interview')
        question = attrs.get('question')
        
        # Verificar que la pregunta pertenezca a la entrevista
        if question.interview != interview:
            raise serializers.ValidationError("La pregunta no pertenece a esta entrevista.")
        
        # Verificar que no haya una respuesta duplicada
        if InterviewResponse.objects.filter(
            interview=interview,
            question=question
        ).exists():
            raise serializers.ValidationError("Ya existe una respuesta para esta pregunta.")
        
        return attrs

class InterviewScheduleSerializer(serializers.ModelSerializer):
    """Serializer para programación de entrevistas"""
    interviewer_name = serializers.CharField(source='interviewer.get_full_name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = InterviewSchedule
        fields = [
            'id', 'interviewer', 'interviewer_name', 'student', 'student_name',
            'project', 'project_title', 'scheduled_date', 'duration_minutes',
            'interview_type', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class InterviewScheduleCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear programaciones de entrevista"""
    
    class Meta:
        model = InterviewSchedule
        fields = [
            'student', 'project', 'scheduled_date', 'duration_minutes',
            'interview_type', 'notes'
        ]
    
    def validate(self, attrs):
        # Verificar que el usuario tenga permisos
        user = self.context['request'].user
        if user.role not in ['admin', 'company']:
            raise serializers.ValidationError("Solo administradores y empresas pueden programar entrevistas.")
        
        # Si es una empresa, verificar que el proyecto sea suyo
        if user.role == 'company':
            project = attrs.get('project')
            if project.company != user:
                raise serializers.ValidationError("Solo puedes programar entrevistas para tus proyectos.")
        
        # Validar que la fecha sea futura
        from django.utils import timezone
        if attrs.get('scheduled_date') <= timezone.now():
            raise serializers.ValidationError("La fecha de la entrevista debe ser futura.")
        
        # Validar que la duración sea razonable
        duration = attrs.get('duration_minutes', 60)
        if duration <= 0 or duration > 480:
            raise serializers.ValidationError("La duración debe estar entre 1 y 480 minutos.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['interviewer'] = self.context['request'].user
        return super().create(validated_data)

class InterviewStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de entrevistas"""
    total_interviews = serializers.IntegerField()
    completed_interviews = serializers.IntegerField()
    scheduled_interviews = serializers.IntegerField()
    cancelled_interviews = serializers.IntegerField()
    average_rating = serializers.FloatField()
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
    average_rating = serializers.FloatField()
    recent_interviews = InterviewSerializer(many=True)
    upcoming_interviews = InterviewSerializer(many=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Obtener entrevistas recientes
        from django.utils import timezone
        recent_interviews = instance.interviews.filter(
            status='completed'
        ).order_by('-scheduled_date')[:5]
        data['recent_interviews'] = InterviewSerializer(recent_interviews, many=True).data
        
        # Obtener entrevistas próximas
        upcoming_interviews = instance.interviews.filter(
            status='scheduled',
            scheduled_date__gte=timezone.now()
        ).order_by('scheduled_date')[:5]
        data['upcoming_interviews'] = InterviewSerializer(upcoming_interviews, many=True).data
        
        return data

class CompanyInterviewSummarySerializer(serializers.Serializer):
    """Serializer para resumen de entrevistas de una empresa"""
    company = UserSerializer()
    total_interviews_conducted = serializers.IntegerField()
    completed_interviews = serializers.IntegerField()
    average_rating_given = serializers.FloatField()
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
                    'completed_interviews': 0,
                    'average_rating': 0
                }
            
            project_stats[project_id]['total_interviews'] += 1
            if interview.status == 'completed':
                project_stats[project_id]['completed_interviews'] += 1
                if interview.rating:
                    project_stats[project_id]['average_rating'] += interview.rating
        
        # Calcular promedios
        for project_data in project_stats.values():
            if project_data['completed_interviews'] > 0:
                project_data['average_rating'] /= project_data['completed_interviews']
        
        data['interviews_by_project'] = project_stats
        return data 
