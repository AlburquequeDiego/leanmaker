from rest_framework import serializers
from .models import Company
from users.serializers import UserSerializer

class CompanySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = [
            'user', 'name', 'industry', 'description', 
            'website', 'location', 'created_at', 'updated_at'
        ]
        # Hacemos que ciertos campos sean de solo lectura al obtener datos,
        # pero que se puedan escribir al actualizar.
        read_only_fields = ['user', 'created_at', 'updated_at']

class CompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'name', 'industry', 'description', 'website', 'location'
        ] 