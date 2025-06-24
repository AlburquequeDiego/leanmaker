from rest_framework import serializers
from .models import Student
from users.serializers import UserSerializer

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Student
        fields = [
            'user', 'university', 'major', 'semester', 'bio', 
            'skills', 'linkedin_profile', 'cv', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

class StudentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'university', 'major', 'semester', 'bio', 'skills', 
            'linkedin_profile', 'cv'
        ] 
