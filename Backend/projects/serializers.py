from rest_framework import serializers
from django.db.models import Avg, Count
from .models import Proyecto
from applications.models import Aplicacion
from users.serializers import UserSerializer
from companies.serializers import CompanySerializer

class ProjectSerializer(serializers.ModelSerializer):
    """Serializer básico para proyectos"""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    company_avatar = serializers.CharField(source='company.avatar', read_only=True)
    is_available = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Proyecto
        fields = [
            'id', 'title', 'description', 'company', 'company_name', 'company_avatar',
            'area', 'modality', 'location', 'difficulty', 'required_skills', 'preferred_skills',
            'min_api_level', 'duration_months', 'hours_per_week', 'start_date', 'estimated_end_date',
            'is_paid', 'payment_amount', 'payment_currency', 'status', 'max_students',
            'current_students', 'is_featured', 'is_urgent', 'tags', 'created_at',
            'is_available', 'completion_percentage', 'applications_count', 'average_rating'
        ]
        read_only_fields = ['id', 'created_at', 'is_available', 'completion_percentage', 'applications_count', 'average_rating']
    
    def get_is_available(self, obj):
        return obj.status.name in ['active', 'open', 'en curso'] and obj.current_students < obj.max_students
    
    def get_completion_percentage(self, obj):
        if obj.max_students == 0:
            return 0
        return (obj.current_students / obj.max_students) * 100
    
    def get_applications_count(self, obj):
        return obj.aplicaciones.count()
    
    def get_average_rating(self, obj):
        from evaluations.models import Evaluation
        evaluations = Evaluation.objects.filter(project=obj)
        if evaluations:
            return evaluations.aggregate(Avg('score'))['score__avg']
        return 0

class ProjectDetailSerializer(ProjectSerializer):
    """Serializer detallado para proyectos"""
    company_details = CompanySerializer(source='company', read_only=True)
    recent_applications = serializers.SerializerMethodField()
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + [
            'company_details', 'recent_applications', 'published_at', 'updated_at'
        ]
        read_only_fields = ProjectSerializer.Meta.read_only_fields + ['published_at', 'updated_at']
    
    def get_recent_applications(self, obj):
        applications = obj.aplicaciones.all().order_by('-fecha_aplicacion')[:5]
        return ProjectApplicationSerializer(applications, many=True).data

class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear proyectos"""
    
    class Meta:
        model = Proyecto
        fields = [
            'title', 'description', 'area', 'modality', 'location', 'difficulty',
            'required_skills', 'preferred_skills', 'min_api_level', 'duration_months',
            'hours_per_week', 'start_date', 'estimated_end_date', 'is_paid', 'payment_amount',
            'payment_currency', 'max_students', 'tags'
        ]
    
    def validate(self, attrs):
        # Validar que las fechas sean coherentes
        if 'start_date' in attrs and 'estimated_end_date' in attrs:
            if attrs['start_date'] >= attrs['estimated_end_date']:
                raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        
        # Validar que el número máximo de estudiantes sea positivo
        if attrs['max_students'] <= 0:
            raise serializers.ValidationError("El número máximo de estudiantes debe ser mayor a 0.")
        
        # Validar que las horas por semana sean razonables
        if attrs['hours_per_week'] <= 0 or attrs['hours_per_week'] > 40:
            raise serializers.ValidationError("Las horas por semana deben estar entre 1 y 40.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.empresa
        return super().create(validated_data)

class ProjectUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar proyectos"""
    
    class Meta:
        model = Proyecto
        fields = [
            'title', 'description', 'area', 'modality', 'location', 'difficulty',
            'required_skills', 'preferred_skills', 'min_api_level', 'duration_months',
            'hours_per_week', 'start_date', 'estimated_end_date', 'is_paid', 'payment_amount',
            'payment_currency', 'max_students', 'status', 'tags', 'is_featured', 'is_urgent'
        ]
        read_only_fields = ['status']  # El status se maneja por separado
    
    def validate(self, attrs):
        # Validaciones similares a ProjectCreateSerializer
        if 'start_date' in attrs and 'estimated_end_date' in attrs:
            if attrs['start_date'] >= attrs['estimated_end_date']:
                raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        
        return attrs

class ProjectApplicationSerializer(serializers.ModelSerializer):
    """Serializer para aplicaciones a proyectos"""
    student_name = serializers.SerializerMethodField()
    student_email = serializers.CharField(source='estudiante.user.email', read_only=True)
    student_avatar = serializers.CharField(source='estudiante.user.avatar', read_only=True)
    student_api_level = serializers.IntegerField(source='estudiante.api_level', read_only=True)
    project_title = serializers.CharField(source='proyecto.title', read_only=True)
    company_name = serializers.CharField(source='proyecto.company.company_name', read_only=True)
    
    class Meta:
        model = Aplicacion
        fields = [
            'id', 'proyecto', 'project_title', 'estudiante', 'student_name', 'student_email',
            'student_avatar', 'student_api_level', 'company_name', 'carta_presentacion', 'estado',
            'puntaje_compatibilidad', 'fecha_aplicacion', 'fecha_revision', 'fecha_respuesta',
            'notas_empresa', 'notas_estudiante', 'url_portfolio', 'url_github', 'url_linkedin'
        ]
        read_only_fields = ['id', 'fecha_aplicacion', 'fecha_revision', 'fecha_respuesta']
    
    def get_student_name(self, obj):
        return obj.estudiante.user.get_full_name() if obj.estudiante and obj.estudiante.user else ""
    
    def validate(self, attrs):
        # Verificar que el estudiante no haya aplicado ya a este proyecto
        if Aplicacion.objects.filter(
            proyecto=attrs['proyecto'], 
            estudiante=attrs['estudiante']
        ).exists():
            raise serializers.ValidationError("Ya has aplicado a este proyecto.")
        
        # Verificar que el proyecto esté disponible
        if attrs['proyecto'].status.name not in ['active', 'open', 'en curso']:
            raise serializers.ValidationError("Este proyecto no está disponible para aplicaciones.")
        
        # Verificar que el proyecto no esté lleno
        if attrs['proyecto'].current_students >= attrs['proyecto'].max_students:
            raise serializers.ValidationError("Este proyecto ya no acepta más estudiantes.")
        
        return attrs

class ProjectApplicationDetailSerializer(ProjectApplicationSerializer):
    """Serializer detallado para aplicaciones"""
    student_details = UserSerializer(source='estudiante.user', read_only=True)
    project_details = ProjectSerializer(source='proyecto', read_only=True)
    
    class Meta(ProjectApplicationSerializer.Meta):
        fields = ProjectApplicationSerializer.Meta.fields + ['student_details', 'project_details']

class ProjectApplicationUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar aplicaciones (solo empresas)"""
    
    class Meta:
        model = Aplicacion
        fields = ['estado', 'notas_empresa']
    
    def validate_estado(self, value):
        valid_states = ['pendiente', 'aceptado', 'rechazado', 'retirado']
        if value not in valid_states:
            raise serializers.ValidationError(f"Estado inválido. Estados válidos: {', '.join(valid_states)}")
        return value
    
    def update(self, instance, validated_data):
        # Actualizar fechas según el cambio de estado
        from django.utils import timezone
        
        if 'estado' in validated_data:
            if validated_data['estado'] == 'aceptado':
                instance.fecha_respuesta = timezone.now()
            elif validated_data['estado'] in ['rechazado', 'retirado']:
                instance.fecha_respuesta = timezone.now()
        
        return super().update(instance, validated_data)

class ProjectStatsSerializer(serializers.ModelSerializer):
    """Serializer para estadísticas de proyectos"""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    applications_count = serializers.SerializerMethodField()
    accepted_applications_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Proyecto
        fields = [
            'id', 'title', 'company_name', 'applications_count', 'accepted_applications_count',
            'average_rating', 'completion_percentage', 'current_students', 'max_students',
            'created_at', 'published_at'
        ]
        read_only_fields = ['id', 'created_at', 'published_at']
    
    def get_applications_count(self, obj):
        return obj.aplicaciones.count()
    
    def get_accepted_applications_count(self, obj):
        return obj.aplicaciones.filter(estado='aceptado').count()
    
    def get_average_rating(self, obj):
        from evaluations.models import Evaluation
        evaluations = Evaluation.objects.filter(project=obj)
        if evaluations:
            return evaluations.aggregate(Avg('score'))['score__avg']
        return 0
    
    def get_completion_percentage(self, obj):
        if obj.max_students == 0:
            return 0
        return (obj.current_students / obj.max_students) * 100

class ProjectSearchSerializer(serializers.ModelSerializer):
    """Serializer para búsqueda de proyectos"""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    is_available = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Proyecto
        fields = [
            'id', 'title', 'description', 'company_name', 'area', 'modality',
            'location', 'difficulty', 'required_skills', 'min_api_level',
            'duration_months', 'hours_per_week', 'is_paid', 'payment_amount',
            'status', 'is_available', 'applications_count', 'created_at',
            'is_featured', 'is_urgent'
        ]
        read_only_fields = ['id', 'created_at', 'is_available', 'applications_count']
    
    def get_is_available(self, obj):
        return obj.status.name in ['active', 'open', 'en curso'] and obj.current_students < obj.max_students
    
    def get_applications_count(self, obj):
        return obj.aplicaciones.count() 
