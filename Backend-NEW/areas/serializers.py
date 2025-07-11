
from .models import Area

class AreaSerializer(serializers.ModelSerializer):
    project_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Area
        fields = [
            'id', 'name', 'description', 'color', 'icon', 
            'is_active', 'project_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class AreaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['name', 'description', 'color', 'icon']

class AreaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['name', 'description', 'color', 'icon', 'is_active'] 