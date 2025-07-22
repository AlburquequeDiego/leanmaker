from rest_framework import serializers
from .models import WorkHour

class WorkHourSerializer(serializers.ModelSerializer):
    empresa_nombre = serializers.CharField(source='company.name', read_only=True)
    empresa_email = serializers.CharField(source='company.email', read_only=True)
    is_project_completion = serializers.BooleanField(read_only=True)

    class Meta:
        model = WorkHour
        fields = [
            'id', 'student', 'student_name', 'student_email', 'project', 'company',
            'empresa_nombre', 'empresa_email',
            'date', 'hours_worked', 'description', 'approved', 'approved_by',
            'approved_at', 'created_at', 'updated_at',
            'student_api_level', 'empresa_gpa', 'estudiante_gpa',
            'is_project_completion'
        ] 