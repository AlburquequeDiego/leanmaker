from rest_framework import serializers
from .models import Strike

class StrikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Strike
        fields = '__all__'
