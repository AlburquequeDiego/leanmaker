from rest_framework import serializers
from django.db.models import Avg, Count
from .models import Project, ProjectApplication, ProjectMember
from users.serializers import UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    """Serializer básico para proyectos"""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    company_avatar = serializers.CharField(source='company.avatar', read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    completion_percentage = serializers.FloatField(read_only=True)
    applications_count = serializers.IntegerField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'company', 'company_name', 'company_avatar',
            'area', 'modality', 'location', 'difficulty', 'required_skills', 'preferred_skills',
            'min_api_level', 'duration_months', 'hours_per_week', 'start_date', 'end_date',
            'is_paid', 'payment_amount', 'payment_currency', 'status', 'max_students',
            'current_students', 'is_featured', 'is_urgent', 'tags', 'created_at',
            'is_available', 'completion_percentage', 'applications_count', 'average_rating'
        ]
        read_only_fields = ['id', 'created_at', 'is_available', 'completion_percentage', 'applications_count', 'average_rating']
    
    def get_average_rating(self, obj):
        evaluations = obj.evaluations.all()
        if evaluations:
            return evaluations.aggregate(Avg('rating'))['rating__avg']
        return 0

class ProjectDetailSerializer(ProjectSerializer):
    """Serializer detallado para proyectos"""
    company_details = UserSerializer(source='company', read_only=True)
    members = serializers.SerializerMethodField()
    recent_applications = serializers.SerializerMethodField()
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + [
            'company_details', 'members', 'recent_applications', 'published_at', 'updated_at'
        ]
        read_only_fields = ProjectSerializer.Meta.read_only_fields + ['published_at', 'updated_at']
    
    def get_members(self, obj):
        members = obj.members.all()[:5]  # Solo los primeros 5 miembros
        return ProjectMemberSerializer(members, many=True).data
    
    def get_recent_applications(self, obj):
        applications = obj.applications.all().order_by('-applied_at')[:5]
        return ProjectApplicationSerializer(applications, many=True).data

class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear proyectos"""
    trl_level = serializers.IntegerField(write_only=True, required=True)
    horas = serializers.IntegerField(write_only=True, required=True)
    
    class Meta:
        model = Project
        fields = [
            'title', 'description', 'area', 'modality', 'location', 'difficulty',
            'required_skills', 'preferred_skills', 'min_api_level', 'duration_months',
            'hours_per_week', 'start_date', 'end_date', 'is_paid', 'payment_amount',
            'payment_currency', 'max_students', 'tags', 'trl_level', 'horas'
        ]
    
    def validate(self, attrs):
        # Validar que las fechas sean coherentes
        if attrs['start_date'] >= attrs['end_date']:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        
        # Validar que el número máximo de estudiantes sea positivo
        if attrs['max_students'] <= 0:
            raise serializers.ValidationError("El número máximo de estudiantes debe ser mayor a 0.")
        
        # Validar que las horas por semana sean razonables
        if attrs['hours_per_week'] <= 0 or attrs['hours_per_week'] > 40:
            raise serializers.ValidationError("Las horas por semana deben estar entre 1 y 40.")
        
        # Validar horas mínimas según TRL
        trl = attrs.get('trl_level')
        horas = attrs.get('horas')
        if trl is None or horas is None:
            raise serializers.ValidationError("Debes especificar el TRL y las horas de práctica.")
        if trl <= 2 and horas < 20:
            raise serializers.ValidationError("Para TRL 1-2 debes ofrecer al menos 20 horas de práctica.")
        if 3 <= trl <= 4 and horas < 40:
            raise serializers.ValidationError("Para TRL 3-4 debes ofrecer al menos 40 horas de práctica.")
        if 5 <= trl <= 6 and horas < 80:
            raise serializers.ValidationError("Para TRL 5-6 debes ofrecer al menos 80 horas de práctica.")
        if 7 <= trl <= 9 and horas < 160:
            raise serializers.ValidationError("Para TRL 7-9 debes ofrecer al menos 160 horas de práctica.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user
        return super().create(validated_data)

class ProjectUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar proyectos"""
    trl_level = serializers.IntegerField(write_only=True, required=False)
    horas = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Project
        fields = [
            'title', 'description', 'area', 'modality', 'location', 'difficulty',
            'required_skills', 'preferred_skills', 'min_api_level', 'duration_months',
            'hours_per_week', 'start_date', 'end_date', 'is_paid', 'payment_amount',
            'payment_currency', 'max_students', 'status', 'tags', 'is_featured', 'is_urgent', 'trl_level', 'horas'
        ]
        read_only_fields = ['status']  # El status se maneja por separado
    
    def validate(self, attrs):
        # Validaciones similares a ProjectCreateSerializer
        if 'start_date' in attrs and 'end_date' in attrs:
            if attrs['start_date'] >= attrs['end_date']:
                raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        
        # Validar horas mínimas según TRL si se proveen
        trl = attrs.get('trl_level')
        horas = attrs.get('horas')
        if trl is not None and horas is not None:
            if trl <= 2 and horas < 20:
                raise serializers.ValidationError("Para TRL 1-2 debes ofrecer al menos 20 horas de práctica.")
            if 3 <= trl <= 4 and horas < 40:
                raise serializers.ValidationError("Para TRL 3-4 debes ofrecer al menos 40 horas de práctica.")
            if 5 <= trl <= 6 and horas < 80:
                raise serializers.ValidationError("Para TRL 5-6 debes ofrecer al menos 80 horas de práctica.")
            if 7 <= trl <= 9 and horas < 160:
                raise serializers.ValidationError("Para TRL 7-9 debes ofrecer al menos 160 horas de práctica.")
        
        return attrs

class ProjectApplicationSerializer(serializers.ModelSerializer):
    """Serializer para aplicaciones a proyectos"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_avatar = serializers.CharField(source='student.avatar', read_only=True)
    student_api_level = serializers.IntegerField(source='student.api_level', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    company_name = serializers.CharField(source='project.company.company_name', read_only=True)
    
    class Meta:
        model = ProjectApplication
        fields = [
            'id', 'project', 'project_title', 'student', 'student_name', 'student_email',
            'student_avatar', 'student_api_level', 'company_name', 'cover_letter', 'status',
            'compatibility_score', 'applied_at', 'reviewed_at', 'responded_at',
            'company_notes', 'student_notes', 'portfolio_url', 'github_url', 'linkedin_url'
        ]
        read_only_fields = ['id', 'applied_at', 'reviewed_at', 'responded_at']
    
    def validate(self, attrs):
        # Verificar que el estudiante no haya aplicado ya a este proyecto
        if ProjectApplication.objects.filter(
            project=attrs['project'], 
            student=attrs['student']
        ).exists():
            raise serializers.ValidationError("Ya has aplicado a este proyecto.")
        
        # Verificar que el proyecto esté disponible
        if not attrs['project'].is_available:
            raise serializers.ValidationError("Este proyecto no está disponible para aplicaciones.")
        
        # Verificar que el estudiante pueda aplicar
        if not attrs['student'].can_apply_to_projects():
            raise serializers.ValidationError("No puedes aplicar a proyectos en este momento.")
        
        return attrs
    
    def create(self, validated_data):
        application = super().create(validated_data)
        
        # Incrementar contador de aplicaciones del proyecto
        application.project.increment_applications()
        
        return application

class ProjectApplicationDetailSerializer(ProjectApplicationSerializer):
    """Serializer detallado para aplicaciones"""
    student_details = UserSerializer(source='student', read_only=True)
    project_details = ProjectSerializer(source='project', read_only=True)
    
    class Meta(ProjectApplicationSerializer.Meta):
        fields = ProjectApplicationSerializer.Meta.fields + ['student_details', 'project_details']

class ProjectApplicationUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar aplicaciones (para empresas)"""
    
    class Meta:
        model = ProjectApplication
        fields = ['status', 'company_notes']
    
    def validate_status(self, value):
        current_status = self.instance.status
        allowed_transitions = {
            'pending': ['reviewing', 'rejected', 'withdrawn'],
            'reviewing': ['interviewed', 'accepted', 'rejected'],
            'interviewed': ['accepted', 'rejected'],
            'accepted': ['completed'],
            'rejected': [],
            'withdrawn': [],
            'completed': []
        }
        
        if value not in allowed_transitions.get(current_status, []):
            raise serializers.ValidationError(f"No se puede cambiar de '{current_status}' a '{value}'.")
        
        return value
    
    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get('status', old_status)
        
        instance = super().update(instance, validated_data)
        
        # Actualizar fechas según el cambio de estado
        if new_status != old_status:
            from django.utils import timezone
            if new_status in ['reviewing', 'interviewed', 'accepted', 'rejected']:
                instance.reviewed_at = timezone.now()
            if new_status in ['accepted', 'rejected']:
                instance.responded_at = timezone.now()
            
            # Si se acepta, incrementar estudiantes actuales
            if new_status == 'accepted' and old_status != 'accepted':
                instance.project.current_students += 1
                instance.project.save(update_fields=['current_students'])
            
            instance.save()
        
        return instance

class ProjectMemberSerializer(serializers.ModelSerializer):
    """Serializer para miembros de proyectos"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_avatar = serializers.CharField(source='user.avatar', read_only=True)
    
    class Meta:
        model = ProjectMember
        fields = [
            'id', 'project', 'user', 'user_name', 'user_email', 'user_avatar',
            'role', 'joined_at', 'left_at', 'hours_worked', 'tasks_completed'
        ]
        read_only_fields = ['id', 'joined_at', 'left_at']

class ProjectStatsSerializer(serializers.ModelSerializer):
    """Serializer para estadísticas de proyectos"""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    applications_count = serializers.IntegerField(read_only=True)
    accepted_applications_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    completion_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'company_name', 'status', 'applications_count',
            'accepted_applications_count', 'average_rating', 'completion_percentage',
            'current_students', 'max_students', 'created_at', 'start_date', 'end_date'
        ]
    
    def get_accepted_applications_count(self, obj):
        return obj.applications.filter(status='accepted').count()
    
    def get_average_rating(self, obj):
        evaluations = obj.evaluations.all()
        if evaluations:
            return evaluations.aggregate(Avg('rating'))['rating__avg']
        return 0

class ProjectSearchSerializer(serializers.ModelSerializer):
    """Serializer para búsqueda de proyectos"""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    applications_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'company_name', 'area', 'modality',
            'location', 'difficulty', 'required_skills', 'min_api_level',
            'duration_months', 'hours_per_week', 'is_paid', 'payment_amount',
            'status', 'is_available', 'applications_count', 'created_at',
            'is_featured', 'is_urgent'
        ]
        read_only_fields = ['id', 'created_at', 'is_available', 'applications_count'] 
