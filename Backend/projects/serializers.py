from rest_framework import serializers
from django.db.models import Avg, Count
from .models import Proyecto, MiembroProyecto
from applications.models import Aplicacion
from users.serializers import UsuarioSerializer
from companies.serializers import EmpresaSerializer

class ProjectSerializer(serializers.ModelSerializer):
    """Serializer básico para proyectos"""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    company_avatar = serializers.CharField(source='company.avatar', read_only=True)
    is_available = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    required_skills = serializers.SerializerMethodField()
    preferred_skills = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    technologies = serializers.SerializerMethodField()
    benefits = serializers.SerializerMethodField()
    
    class Meta:
        model = Proyecto
        fields = [
            'id', 'title', 'description', 'company', 'company_name', 'company_avatar',
            'area', 'modality', 'location', 'difficulty', 'required_skills', 'preferred_skills',
            'min_api_level', 'duration_weeks', 'hours_per_week', 'start_date', 'estimated_end_date',
            'is_paid', 'payment_amount', 'payment_currency', 'stipend_amount', 'stipend_currency',
            'status', 'max_students', 'current_students', 'is_featured', 'is_urgent', 'tags',
            'technologies', 'benefits', 'requirements', 'application_deadline', 'created_at',
            'is_available', 'completion_percentage', 'applications_count', 'average_rating'
        ]
        read_only_fields = ['id', 'created_at', 'is_available', 'completion_percentage', 'applications_count', 'average_rating']
    
    def get_required_skills(self, obj):
        """Obtiene las habilidades requeridas como lista"""
        return obj.get_required_skills_list()
    
    def get_preferred_skills(self, obj):
        """Obtiene las habilidades preferidas como lista"""
        return obj.get_preferred_skills_list()
    
    def get_tags(self, obj):
        """Obtiene las etiquetas como lista"""
        return obj.get_tags_list()
    
    def get_technologies(self, obj):
        """Obtiene las tecnologías como lista"""
        return obj.get_technologies_list()
    
    def get_benefits(self, obj):
        """Obtiene los beneficios como lista"""
        return obj.get_benefits_list()
    
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
    
    def to_representation(self, instance):
        """Convierte la instancia a diccionario para la API"""
        data = super().to_representation(instance)
        # Asegurar que el campo company sea un string (UUID)
        if instance.company:
            data['company'] = str(instance.company.id)
        return data

# Alias para compatibilidad
ProyectoSerializer = ProjectSerializer

class ProjectDetailSerializer(ProjectSerializer):
    """Serializer detallado para proyectos"""
    company_details = EmpresaSerializer(source='company', read_only=True)
    recent_applications = serializers.SerializerMethodField()
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + [
            'company_details', 'recent_applications', 'published_at', 'updated_at'
        ]
        read_only_fields = ProjectSerializer.Meta.read_only_fields + ['published_at', 'updated_at']
    
    def get_recent_applications(self, obj):
        applications = obj.application_project.all().order_by('-applied_at')[:5]
        return ProjectApplicationSerializer(applications, many=True).data

class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear proyectos"""
    required_skills = serializers.ListField(child=serializers.CharField(), required=False)
    preferred_skills = serializers.ListField(child=serializers.CharField(), required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    technologies = serializers.ListField(child=serializers.CharField(), required=False)
    benefits = serializers.ListField(child=serializers.CharField(), required=False)
    
    class Meta:
        model = Proyecto
        fields = [
            'title', 'description', 'requirements', 'area', 'modality', 'location', 'difficulty',
            'required_skills', 'preferred_skills', 'min_api_level', 'duration_weeks',
            'hours_per_week', 'start_date', 'estimated_end_date', 'application_deadline',
            'is_paid', 'payment_amount', 'payment_currency', 'stipend_amount', 'stipend_currency',
            'max_students', 'tags', 'technologies', 'benefits'
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
        # Manejar campos JSON
        required_skills = validated_data.pop('required_skills', [])
        preferred_skills = validated_data.pop('preferred_skills', [])
        tags = validated_data.pop('tags', [])
        technologies = validated_data.pop('technologies', [])
        benefits = validated_data.pop('benefits', [])
        
        validated_data['company'] = self.context['request'].user.empresa
        proyecto = Proyecto.objects.create(**validated_data)
        proyecto.set_required_skills_list(required_skills)
        proyecto.set_preferred_skills_list(preferred_skills)
        proyecto.set_tags_list(tags)
        proyecto.set_technologies_list(technologies)
        proyecto.set_benefits_list(benefits)
        proyecto.save()
        
        return proyecto

class ProjectUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar proyectos"""
    required_skills = serializers.ListField(child=serializers.CharField(), required=False)
    preferred_skills = serializers.ListField(child=serializers.CharField(), required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    technologies = serializers.ListField(child=serializers.CharField(), required=False)
    benefits = serializers.ListField(child=serializers.CharField(), required=False)
    
    class Meta:
        model = Proyecto
        fields = [
            'title', 'description', 'requirements', 'area', 'modality', 'location', 'difficulty',
            'required_skills', 'preferred_skills', 'min_api_level', 'duration_weeks',
            'hours_per_week', 'start_date', 'estimated_end_date', 'application_deadline',
            'is_paid', 'payment_amount', 'payment_currency', 'stipend_amount', 'stipend_currency',
            'max_students', 'status', 'tags', 'technologies', 'benefits', 'is_featured', 'is_urgent'
        ]
        read_only_fields = ['status']  # El status se maneja por separado
    
    def validate(self, attrs):
        # Validaciones similares a ProjectCreateSerializer
        if 'start_date' in attrs and 'estimated_end_date' in attrs:
            if attrs['start_date'] >= attrs['estimated_end_date']:
                raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        
        return attrs
    
    def update(self, instance, validated_data):
        # Manejar campos JSON
        if 'required_skills' in validated_data:
            instance.set_required_skills_list(validated_data.pop('required_skills'))
        if 'preferred_skills' in validated_data:
            instance.set_preferred_skills_list(validated_data.pop('preferred_skills'))
        if 'tags' in validated_data:
            instance.set_tags_list(validated_data.pop('tags'))
        if 'technologies' in validated_data:
            instance.set_technologies_list(validated_data.pop('technologies'))
        if 'benefits' in validated_data:
            instance.set_benefits_list(validated_data.pop('benefits'))
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class ProjectApplicationSerializer(serializers.ModelSerializer):
    """Serializer para aplicaciones a proyectos"""
    student_name = serializers.SerializerMethodField()
    student_email = serializers.CharField(source='student.user.email', read_only=True)
    student_avatar = serializers.CharField(source='student.user.avatar', read_only=True)
    student_api_level = serializers.IntegerField(source='student.api_level', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    company_name = serializers.CharField(source='project.company.company_name', read_only=True)
    
    class Meta:
        model = Aplicacion
        fields = [
            'id', 'project', 'project_title', 'student', 'student_name', 'student_email',
            'student_avatar', 'student_api_level', 'company_name', 'cover_letter', 'status',
            'compatibility_score', 'applied_at', 'reviewed_at', 'responded_at',
            'company_notes', 'student_notes', 'portfolio_url', 'github_url', 'linkedin_url'
        ]
        read_only_fields = ['id', 'applied_at', 'reviewed_at', 'responded_at']
    
    def get_student_name(self, obj):
        return obj.student.user.full_name if obj.student and obj.student.user else ""
    
    def validate(self, attrs):
        # Verificar que el estudiante no haya aplicado ya a este proyecto
        if Aplicacion.objects.filter(
            project=attrs['project'], 
            student=attrs['student']
        ).exists():
            raise serializers.ValidationError("Ya has aplicado a este proyecto.")
        
        # Verificar que el proyecto esté disponible
        if attrs['project'].status and attrs['project'].status.name not in ['active', 'open', 'en curso']:
            raise serializers.ValidationError("Este proyecto no está disponible para aplicaciones.")
        
        # Verificar que el proyecto no esté lleno
        if attrs['project'].current_students >= attrs['project'].max_students:
            raise serializers.ValidationError("Este proyecto ya no acepta más estudiantes.")
        
        return attrs
    
    def to_representation(self, instance):
        """Convierte la instancia a diccionario para la API"""
        data = super().to_representation(instance)
        # Asegurar que los campos de relación sean strings (UUIDs)
        if instance.project:
            data['project'] = str(instance.project.id)
        if instance.student:
            data['student'] = str(instance.student.id)
        return data

class ProjectApplicationDetailSerializer(ProjectApplicationSerializer):
    """Serializer detallado para aplicaciones"""
    student_details = UsuarioSerializer(source='student.user', read_only=True)
    project_details = ProjectSerializer(source='project', read_only=True)
    
    class Meta(ProjectApplicationSerializer.Meta):
        fields = ProjectApplicationSerializer.Meta.fields + ['student_details', 'project_details']

class ProjectApplicationUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar aplicaciones (solo empresas)"""
    
    class Meta:
        model = Aplicacion
        fields = ['status', 'company_notes']
    
    def validate_status(self, value):
        valid_states = ['pending', 'reviewing', 'interviewed', 'accepted', 'rejected', 'withdrawn', 'completed']
        if value not in valid_states:
            raise serializers.ValidationError(f"Estado inválido. Estados válidos: {', '.join(valid_states)}")
        return value
    
    def update(self, instance, validated_data):
        # Actualizar fechas según el cambio de estado
        from django.utils import timezone
        
        if 'status' in validated_data:
            if validated_data['status'] == 'accepted':
                instance.responded_at = timezone.now()
            elif validated_data['status'] in ['rejected', 'withdrawn']:
                instance.responded_at = timezone.now()
        
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
        return obj.application_project.count()
    
    def get_accepted_applications_count(self, obj):
        return obj.application_project.filter(status='accepted').count()
    
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
        return obj.application_project.count() 

class ProjectMemberSerializer(serializers.ModelSerializer):
    """Serializer para miembros de proyecto"""
    user_name = serializers.CharField(source='usuario.full_name', read_only=True)
    user_email = serializers.CharField(source='usuario.email', read_only=True)
    project_title = serializers.CharField(source='proyecto.title', read_only=True)
    
    class Meta:
        model = MiembroProyecto
        fields = [
            'id', 'proyecto', 'project_title', 'usuario', 'user_name', 'user_email',
            'rol', 'fecha_ingreso', 'fecha_salida', 'horas_trabajadas', 'tareas_completadas',
            'evaluacion_promedio', 'esta_activo', 'es_verificado', 'responsabilidades', 'notas'
        ]
        read_only_fields = ['id', 'fecha_ingreso'] 
