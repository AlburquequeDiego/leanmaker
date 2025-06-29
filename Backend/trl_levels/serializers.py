from rest_framework import serializers
from .models import TRLLevel

class TRLLevelSerializer(serializers.ModelSerializer):
    """Serializer para niveles TRL"""
    
    class Meta:
        model = TRLLevel
        fields = [
            'id', 'level', 'name', 'description', 'min_hours', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class TRLLevelListSerializer(serializers.ModelSerializer):
    """Serializer para listar niveles TRL"""
    
    class Meta:
        model = TRLLevel
        fields = ['id', 'level', 'name', 'min_hours', 'is_active'] 