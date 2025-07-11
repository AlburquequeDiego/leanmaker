
from .models import WorkHour

class WorkHourSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkHour
        fields = '__all__'
