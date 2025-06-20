from rest_framework import serializers
from .models import CalendarEvent
from users.serializers import UserSerializer

class CalendarEventSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    participants = UserSerializer(many=True, read_only=True)
    is_all_day = serializers.ReadOnlyField()
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'start_date', 'end_date',
            'project', 'created_by', 'participants', 'location', 'color',
            'is_all_day', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Valida que las fechas sean coherentes.
        """
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError(
                "La fecha de fin debe ser posterior a la fecha de inicio."
            )
        
        return data

class CalendarEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = [
            'title', 'description', 'event_type', 'start_date', 'end_date',
            'project', 'participants', 'location', 'color'
        ]

    def validate(self, data):
        """
        Valida que las fechas sean coherentes.
        """
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError(
                "La fecha de fin debe ser posterior a la fecha de inicio."
            )
        
        return data 