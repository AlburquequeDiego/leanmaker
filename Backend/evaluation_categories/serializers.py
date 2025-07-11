from rest_framework import serializers
from .models import EvaluationCategory


class EvaluationCategorySerializer(serializers.ModelSerializer):
    """Serializer para el modelo EvaluationCategory"""
    
    class Meta:
        model = EvaluationCategory
        fields = ['id', 'name', 'description', 'is_active']
        read_only_fields = ['id']

    def validate_name(self, value):
        """Validar el nombre de la categoría"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("El nombre debe tener al menos 2 caracteres")
        return value.strip()

    def validate_description(self, value):
        """Validar la descripción"""
        if value and len(value.strip()) < 10:
            raise serializers.ValidationError("La descripción debe tener al menos 10 caracteres")
        return value.strip() if value else value


class EvaluationCategoryListSerializer(serializers.ModelSerializer):
    """Serializer para listar categorías de evaluación"""
    
    class Meta:
        model = EvaluationCategory
        fields = ['id', 'name', 'description', 'is_active'] 