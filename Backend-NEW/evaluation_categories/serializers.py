
from .models import EvaluationCategory

class EvaluationCategoryModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCategory
        fields = ['id', 'name', 'description', 'is_active']
        read_only_fields = ['id'] 