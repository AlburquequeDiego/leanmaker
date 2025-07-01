from rest_framework import serializers
from .models import Evaluation, EvaluationCategoryScore, EvaluationCategory, EvaluationTemplate
from projects.serializers import ProjectSerializer
from companies.serializers import CompanySerializer
from students.serializers import StudentSerializer
from users.serializers import UserSerializer

class EvaluationCategoryScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCategoryScore
        fields = ['id', 'category', 'rating']

class EvaluationSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    student = StudentSerializer(read_only=True)
    evaluator = UserSerializer(read_only=True)
    categories = EvaluationCategoryScoreSerializer(many=True, read_only=True)
    
    class Meta:
        model = Evaluation
        fields = [
            'id', 'project', 'company', 'student', 'evaluator', 'evaluator_role',
            'date', 'status', 'type', 'overall_rating', 'comments', 'strengths',
            'areas_for_improvement', 'project_duration', 'technologies',
            'deliverables', 'categories', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date', 'created_at', 'updated_at']

class EvaluationCreateSerializer(serializers.ModelSerializer):
    categories_data = serializers.ListField(write_only=True, required=False)
    
    class Meta:
        model = Evaluation
        fields = [
            'project', 'company', 'student', 'evaluator', 'evaluator_role',
            'status', 'type', 'overall_rating', 'comments', 'strengths',
            'areas_for_improvement', 'project_duration', 'technologies',
            'deliverables', 'categories_data'
        ]

    def create(self, validated_data):
        categories_data = validated_data.pop('categories_data', [])
        evaluation = Evaluation.objects.create(**validated_data)
        
        for category_data in categories_data:
            EvaluationCategoryScore.objects.create(
                evaluation=evaluation,
                **category_data
            )
        
        return evaluation

class EvaluationUpdateSerializer(serializers.ModelSerializer):
    categories_data = serializers.ListField(write_only=True, required=False)
    
    class Meta:
        model = Evaluation
        fields = [
            'evaluator_role', 'status', 'type', 'overall_rating', 'comments',
            'strengths', 'areas_for_improvement', 'project_duration',
            'technologies', 'deliverables', 'categories_data'
        ]

    def update(self, instance, validated_data):
        categories_data = validated_data.pop('categories_data', None)
        
        # Actualizar evaluación
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar categorías si se proporcionan
        if categories_data is not None:
            # Eliminar categorías existentes
            instance.categories.all().delete()
            
            # Crear nuevas categorías
            for category_data in categories_data:
                EvaluationCategoryScore.objects.create(
                    evaluation=instance,
                    **category_data
                )
        
        return instance

class EvaluationCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCategory
        fields = ['id', 'name', 'description', 'is_active']

class EvaluationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationTemplate
        fields = ['id', 'name', 'description', 'categories', 'is_active', 'created_at', 'updated_at'] 