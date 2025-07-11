
from .models import Rating

class RatingSerializer(serializers.ModelSerializer):
    """Serializer para calificaciones"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = Rating
        fields = [
            'id', 'project', 'project_title', 'user', 'user_name',
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def validate_rating(self, value):
        """Validar que la calificación esté entre 1 y 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5")
        return value 