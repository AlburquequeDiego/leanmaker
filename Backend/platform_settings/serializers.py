from rest_framework import serializers
from .models import PlatformSetting
import json

class PlatformSettingSerializer(serializers.ModelSerializer):
    typed_value = serializers.SerializerMethodField()
    
    class Meta:
        model = PlatformSetting
        fields = ['id', 'key', 'value', 'setting_type', 'description', 'typed_value', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_typed_value(self, obj):
        return obj.get_typed_value()
    
    def validate(self, data):
        """
        Valida que el valor sea apropiado para el tipo de configuración.
        """
        value = data.get('value', '')
        setting_type = data.get('setting_type', '')
        
        if setting_type == 'INTEGER':
            try:
                int(value)
            except ValueError:
                raise serializers.ValidationError("El valor debe ser un número entero válido.")
        
        elif setting_type == 'FLOAT':
            try:
                float(value)
            except ValueError:
                raise serializers.ValidationError("El valor debe ser un número decimal válido.")
        
        elif setting_type == 'BOOLEAN':
            if value.lower() not in ('true', 'false', '1', '0', 'yes', 'no', 'on', 'off'):
                raise serializers.ValidationError("El valor debe ser un booleano válido (true/false, 1/0, yes/no, on/off).")
        
        elif setting_type == 'JSON':
            try:
                json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("El valor debe ser un JSON válido.")
        
        return data 