from rest_framework import serializers
from .models import Strike
from students.serializers import StudentSerializer

class StrikeSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)

    class Meta:
        model = Strike
        fields = ['id', 'project', 'student', 'company', 'reason', 'created_at']
        read_only_fields = ['id', 'company', 'created_at']

class StrikeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Strike
        fields = ['student', 'project', 'reason'] 