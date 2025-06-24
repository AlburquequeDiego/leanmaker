from rest_framework import serializers
from django.db.models import Avg, Count
from .models import Evaluation, EvaluationTemplate, StudentSkill, StudentPortfolio, StudentAchievement
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer

class EvaluationSerializer(serializers.ModelSerializer):
    """Serializer básico para evaluaciones"""
    evaluator_name = serializers.CharField(source='evaluator.get_full_name', read_only=True)
    evaluator_avatar = serializers.CharField(source='evaluator.avatar', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_avatar = serializers.CharField(source='student.avatar', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    company_name = serializers.CharField(source='project.company.company_name', read_only=True)
    rating_stars = serializers.CharField(read_only=True)
    
    class Meta:
        model = Evaluation
        fields = [
            'id', 'project', 'project_title', 'student', 'student_name', 'student_avatar',
            'evaluator', 'evaluator_name', 'evaluator_avatar', 'company_name',
            'application', 'category', 'rating', 'rating_stars', 'comment',
            'created_at', 'updated_at', 'evaluation_date', 'is_anonymous', 'is_public'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'rating_stars']
    
    def validate(self, attrs):
        # Verificar que el evaluador no se evalúe a sí mismo
        if attrs['evaluator'] == attrs['student']:
            raise serializers.ValidationError("No puedes evaluarte a ti mismo.")
        
        # Verificar que no haya una evaluación duplicada
        if Evaluation.objects.filter(
            project=attrs['project'],
            student=attrs['student'],
            evaluator=attrs['evaluator'],
            category=attrs['category']
        ).exists():
            raise serializers.ValidationError("Ya has evaluado este aspecto del estudiante en este proyecto.")
        
        return attrs
    
    def create(self, validated_data):
        evaluation = super().create(validated_data)
        
        # Actualizar promedio de evaluaciones del estudiante si es necesario
        if evaluation.category == 'overall':
            evaluations = evaluation.student.received_evaluations.filter(category='overall')
            if evaluations.count() > 0:
                avg_rating = evaluations.aggregate(Avg('rating'))['rating__avg']
                # Aquí podrías actualizar algún campo en el modelo User si es necesario
        
        return evaluation

class EvaluationDetailSerializer(EvaluationSerializer):
    """Serializer detallado para evaluaciones"""
    evaluator_details = UserSerializer(source='evaluator', read_only=True)
    student_details = UserSerializer(source='student', read_only=True)
    project_details = ProjectSerializer(source='project', read_only=True)
    
    class Meta(EvaluationSerializer.Meta):
        fields = EvaluationSerializer.Meta.fields + ['evaluator_details', 'student_details', 'project_details']

class EvaluationCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear evaluaciones"""
    
    class Meta:
        model = Evaluation
        fields = [
            'project', 'student', 'application', 'category', 'rating', 'comment',
            'evaluation_date', 'is_anonymous', 'is_public'
        ]
    
    def validate(self, attrs):
        # Validaciones básicas
        if attrs['rating'] < 1 or attrs['rating'] > 5:
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5.")
        
        # Verificar que el evaluador tenga permisos para evaluar
        user = self.context['request'].user
        if user.role == 'student':
            raise serializers.ValidationError("Los estudiantes no pueden crear evaluaciones.")
        
        # Si es una empresa, verificar que el proyecto sea suyo
        if user.role == 'company':
            if attrs['project'].company != user:
                raise serializers.ValidationError("Solo puedes evaluar estudiantes de tus propios proyectos.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['evaluator'] = self.context['request'].user
        return super().create(validated_data)

class StudentSkillSerializer(serializers.ModelSerializer):
    """Serializer para habilidades de estudiantes"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)
    
    class Meta:
        model = StudentSkill
        fields = [
            'id', 'student', 'student_name', 'skill_name', 'level', 'years_experience',
            'is_verified', 'verified_by', 'verified_by_name', 'verified_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'verified_by_name']

class StudentSkillCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear habilidades"""
    
    class Meta:
        model = StudentSkill
        fields = ['skill_name', 'level', 'years_experience']
    
    def validate(self, attrs):
        # Verificar que no exista ya esta habilidad para el estudiante
        student = self.context['request'].user
        if StudentSkill.objects.filter(student=student, skill_name=attrs['skill_name']).exists():
            raise serializers.ValidationError("Ya tienes registrada esta habilidad.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)

class StudentPortfolioSerializer(serializers.ModelSerializer):
    """Serializer para portafolio de estudiantes"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = StudentPortfolio
        fields = [
            'id', 'student', 'student_name', 'title', 'description', 'project_url',
            'github_url', 'technologies', 'images', 'start_date', 'end_date',
            'created_at', 'updated_at', 'is_featured', 'is_public'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class StudentPortfolioCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear proyectos de portafolio"""
    
    class Meta:
        model = StudentPortfolio
        fields = [
            'title', 'description', 'project_url', 'github_url', 'technologies',
            'images', 'start_date', 'end_date', 'is_featured', 'is_public'
        ]
    
    def validate(self, attrs):
        # Validar que las fechas sean coherentes
        if 'start_date' in attrs and 'end_date' in attrs:
            if attrs['start_date'] > attrs['end_date']:
                raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)

class StudentAchievementSerializer(serializers.ModelSerializer):
    """Serializer para logros de estudiantes"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = StudentAchievement
        fields = [
            'id', 'student', 'student_name', 'title', 'description', 'achievement_type',
            'issuer', 'issue_date', 'expiry_date', 'certificate_url', 'badge_url',
            'created_at', 'updated_at', 'is_expired'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_expired']

class StudentAchievementCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear logros"""
    
    class Meta:
        model = StudentAchievement
        fields = [
            'title', 'description', 'achievement_type', 'issuer', 'issue_date',
            'expiry_date', 'certificate_url', 'badge_url'
        ]
    
    def validate(self, attrs):
        # Validar que las fechas sean coherentes
        if 'issue_date' in attrs and 'expiry_date' in attrs:
            if attrs['issue_date'] > attrs['expiry_date']:
                raise serializers.ValidationError("La fecha de emisión debe ser anterior a la fecha de expiración.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)

class EvaluationTemplateSerializer(serializers.ModelSerializer):
    """Serializer para plantillas de evaluación"""
    
    class Meta:
        model = EvaluationTemplate
        fields = [
            'id', 'name', 'description', 'notification_type', 'categories',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class StudentEvaluationSummarySerializer(serializers.Serializer):
    """Serializer para resumen de evaluaciones de un estudiante"""
    student = UserSerializer()
    total_evaluations = serializers.IntegerField()
    average_rating = serializers.FloatField()
    category_breakdown = serializers.DictField()
    recent_evaluations = EvaluationSerializer(many=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular desglose por categorías
        evaluations = instance.received_evaluations.all()
        category_breakdown = {}
        
        for category, _ in Evaluation.CATEGORY_CHOICES:
            category_evaluations = evaluations.filter(category=category)
            if category_evaluations.exists():
                category_breakdown[category] = {
                    'count': category_evaluations.count(),
                    'average': category_evaluations.aggregate(Avg('rating'))['rating__avg']
                }
        
        data['category_breakdown'] = category_breakdown
        return data

class CompanyEvaluationSummarySerializer(serializers.Serializer):
    """Serializer para resumen de evaluaciones de una empresa"""
    company = UserSerializer()
    total_evaluations_given = serializers.IntegerField()
    average_rating_given = serializers.FloatField()
    evaluations_by_project = serializers.DictField()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular evaluaciones por proyecto
        evaluations = instance.given_evaluations.all()
        evaluations_by_project = {}
        
        for evaluation in evaluations:
            project_id = str(evaluation.project.id)
            if project_id not in evaluations_by_project:
                evaluations_by_project[project_id] = {
                    'project_title': evaluation.project.title,
                    'evaluations_count': 0,
                    'average_rating': 0
                }
            
            evaluations_by_project[project_id]['evaluations_count'] += 1
        
        # Calcular promedios
        for project_data in evaluations_by_project.values():
            project_evaluations = evaluations.filter(project__title=project_data['project_title'])
            project_data['average_rating'] = project_evaluations.aggregate(Avg('rating'))['rating__avg']
        
        data['evaluations_by_project'] = evaluations_by_project
        return data

class EvaluationStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas generales de evaluaciones"""
    total_evaluations = serializers.IntegerField()
    average_rating = serializers.FloatField()
    evaluations_by_category = serializers.DictField()
    evaluations_by_month = serializers.ListField()
    top_rated_students = serializers.ListField()
    top_rated_companies = serializers.ListField()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas por categoría
        from evaluations.models import Evaluation
        evaluations = Evaluation.objects.all()
        
        category_stats = {}
        for category, _ in Evaluation.CATEGORY_CHOICES:
            category_evaluations = evaluations.filter(category=category)
            if category_evaluations.exists():
                category_stats[category] = {
                    'count': category_evaluations.count(),
                    'average': category_evaluations.aggregate(Avg('rating'))['rating__avg']
                }
        
        data['evaluations_by_category'] = category_stats
        return data 
