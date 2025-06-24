from rest_framework import serializers
from .models import WorkHours

class WorkHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkHours
        fields = '__all__'
