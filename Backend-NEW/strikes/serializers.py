
from .models import Strike

class StrikeSerializer(serializers.ModelSerializer):
    """Serializer para strikes"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    issued_by_name = serializers.CharField(source='issued_by.full_name', read_only=True)
    
    class Meta:
        model = Strike
        fields = [
            'id', 'student', 'student_name', 'issued_by', 'issued_by_name',
            'reason', 'severity', 'is_active', 'issued_at', 'resolved_at', 'resolution_notes'
        ]
        read_only_fields = ['issued_by', 'issued_at'] 