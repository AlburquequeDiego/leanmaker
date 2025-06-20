from rest_framework import serializers
from .models import WorkHours
from users.serializers import UserSerializer

class WorkHoursSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)
    hours_worked = serializers.ReadOnlyField()
    hours_worked_formatted = serializers.ReadOnlyField()
    
    class Meta:
        model = WorkHours
        fields = [
            'id', 'student', 'project', 'date', 'start_time', 'end_time',
            'description', 'is_approved', 'approved_by', 'approved_at',
            'hours_worked', 'hours_worked_formatted', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'approved_by', 'approved_at', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Valida que las horas sean coherentes.
        """
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        date = data.get('date')
        
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError(
                "La hora de fin debe ser posterior a la hora de inicio."
            )
        
        return data

class WorkHoursCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkHours
        fields = ['project', 'date', 'start_time', 'end_time', 'description']

    def validate(self, data):
        """
        Valida que las horas sean coherentes.
        """
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError(
                "La hora de fin debe ser posterior a la hora de inicio."
            )
        
        return data

class WorkHoursApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkHours
        fields = ['is_approved'] 