from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Usuario

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer para registro de usuarios"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password', 'password_confirm', 'role',
            'phone', 'career', 'semester', 'graduation_year', 'company_name',
            'company_description', 'company_website', 'company_size', 'company_industry',
            'company_location'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        
        # Validaciones específicas por rol
        role = attrs.get('role')
        if role == 'student':
            if not attrs.get('career'):
                raise serializers.ValidationError("La carrera es requerida para estudiantes.")
            if not attrs.get('semester'):
                raise serializers.ValidationError("El semestre es requerido para estudiantes.")
        elif role == 'company':
            if not attrs.get('company_name'):
                raise serializers.ValidationError("El nombre de la empresa es requerido.")
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    """Serializer básico para usuarios"""
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    strike_status = serializers.SerializerMethodField()
    can_apply = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'role_display',
            'phone', 'avatar', 'bio', 'is_active', 'is_verified', 'created_at',
            'career', 'semester', 'graduation_year', 'gpa', 'api_level', 'strikes',
            'total_hours', 'completed_projects', 'company_name', 'company_description',
            'company_website', 'company_size', 'company_industry', 'company_location',
            'company_rating', 'strike_status', 'can_apply'
        ]
        read_only_fields = ['id', 'created_at', 'strike_status', 'can_apply']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_strike_status(self, obj):
        return obj.get_strike_status()
    
    def get_can_apply(self, obj):
        return obj.can_apply_to_projects()

class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer específico para perfiles de estudiantes"""
    full_name = serializers.SerializerMethodField()
    strike_status = serializers.SerializerMethodField()
    can_apply = serializers.SerializerMethodField()
    skills_count = serializers.SerializerMethodField()
    portfolio_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'phone', 'avatar', 'bio',
            'career', 'semester', 'graduation_year', 'gpa', 'api_level', 'strikes',
            'total_hours', 'completed_projects', 'is_verified', 'created_at',
            'strike_status', 'can_apply', 'skills_count', 'portfolio_count'
        ]
        read_only_fields = ['id', 'created_at', 'strike_status', 'can_apply', 'skills_count', 'portfolio_count']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_strike_status(self, obj):
        return obj.get_strike_status()
    
    def get_can_apply(self, obj):
        return obj.can_apply_to_projects()
    
    def get_skills_count(self, obj):
        return obj.skills.count()
    
    def get_portfolio_count(self, obj):
        return obj.portfolio_items.count()

class CompanyProfileSerializer(serializers.ModelSerializer):
    """Serializer específico para perfiles de empresas"""
    full_name = serializers.SerializerMethodField()
    projects_count = serializers.SerializerMethodField()
    active_projects_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'phone', 'avatar', 'bio',
            'company_name', 'company_description', 'company_website', 'company_size',
            'company_industry', 'company_location', 'company_rating', 'is_verified',
            'created_at', 'projects_count', 'active_projects_count'
        ]
        read_only_fields = ['id', 'created_at', 'projects_count', 'active_projects_count']
    
    def get_full_name(self, obj):
        return obj.company_name or obj.get_full_name()
    
    def get_projects_count(self, obj):
        return obj.company_projects.count()
    
    def get_active_projects_count(self, obj):
        return obj.company_projects.filter(status='published').count()

class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer para administradores con información completa"""
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    last_activity = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()
    evaluations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'role_display',
            'phone', 'avatar', 'bio', 'is_active', 'is_verified', 'created_at', 'last_login',
            'career', 'semester', 'graduation_year', 'gpa', 'api_level', 'strikes',
            'total_hours', 'completed_projects', 'company_name', 'company_description',
            'company_website', 'company_size', 'company_industry', 'company_location',
            'company_rating', 'last_activity', 'applications_count', 'evaluations_count'
        ]
        read_only_fields = ['id', 'created_at', 'last_login', 'last_activity', 'applications_count', 'evaluations_count']
    
    def get_full_name(self, obj):
        if obj.role == 'company' and obj.company_name:
            return obj.company_name
        return obj.get_full_name()
    
    def get_last_activity(self, obj):
        return obj.last_login or obj.created_at
    
    def get_applications_count(self, obj):
        if obj.role == 'student':
            return obj.student_applications.count()
        return 0
    
    def get_evaluations_count(self, obj):
        if obj.role == 'student':
            return obj.received_evaluations.count()
        elif obj.role == 'company':
            return obj.given_evaluations.count()
        return 0

class UserLoginSerializer(serializers.Serializer):
    """Serializer para login de usuarios"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Credenciales inválidas.')
            if not user.is_active:
                raise serializers.ValidationError('Usuario desactivado.')
        else:
            raise serializers.ValidationError('Debe proporcionar email y contraseña.')
        
        attrs['user'] = user
        return attrs

class PasswordChangeSerializer(serializers.Serializer):
    """Serializer para cambio de contraseña"""
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Las nuevas contraseñas no coinciden.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value

class PasswordResetSerializer(serializers.Serializer):
    """Serializer para reset de contraseña"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("No existe un usuario activo con este email.")
        return value

class UserStatsSerializer(serializers.ModelSerializer):
    """Serializer para estadísticas de usuario"""
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    # Estadísticas de estudiante
    applications_count = serializers.SerializerMethodField()
    accepted_applications_count = serializers.SerializerMethodField()
    completed_projects_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    # Estadísticas de empresa
    published_projects_count = serializers.SerializerMethodField()
    active_projects_count = serializers.SerializerMethodField()
    total_applications_received = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'role_display', 'created_at',
            'applications_count', 'accepted_applications_count', 'completed_projects_count',
            'average_rating', 'published_projects_count', 'active_projects_count',
            'total_applications_received', 'total_hours', 'gpa', 'strikes', 'api_level'
        ]
    
    def get_full_name(self, obj):
        if obj.role == 'company' and obj.company_name:
            return obj.company_name
        return obj.get_full_name()
    
    def get_applications_count(self, obj):
        if obj.role == 'student':
            return obj.student_applications.count()
        return 0
    
    def get_accepted_applications_count(self, obj):
        if obj.role == 'student':
            return obj.student_applications.filter(status='accepted').count()
        return 0
    
    def get_completed_projects_count(self, obj):
        if obj.role == 'student':
            return obj.completed_projects
        return 0
    
    def get_average_rating(self, obj):
        if obj.role == 'student':
            evaluations = obj.received_evaluations.all()
            if evaluations:
                return sum(eval.rating for eval in evaluations) / evaluations.count()
        return 0
    
    def get_published_projects_count(self, obj):
        if obj.role == 'company':
            return obj.company_projects.filter(status='published').count()
        return 0
    
    def get_active_projects_count(self, obj):
        if obj.role == 'company':
            return obj.company_projects.filter(status='in_progress').count()
        return 0
    
    def get_total_applications_received(self, obj):
        if obj.role == 'company':
            return sum(project.applications.count() for project in obj.company_projects.all())
        return 0 
