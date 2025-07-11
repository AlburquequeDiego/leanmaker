from rest_framework import serializers
from .models import PlatformSetting
import json

class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = [
            'id', 'key', 'value', 'setting_type', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_key(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("La clave debe tener al menos 2 caracteres")
        return value.strip()

    def validate(self, data):
        setting_type = data.get('setting_type')
        value = data.get('value')
        if setting_type == 'INTEGER':
            try:
                int(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError({'value': 'Debe ser un número entero'})
        elif setting_type == 'FLOAT':
            try:
                float(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError({'value': 'Debe ser un número decimal'})
        elif setting_type == 'BOOLEAN':
            if str(value).lower() not in ('true', 'false', '1', '0', 'yes', 'no', 'on', 'off'):
                raise serializers.ValidationError({'value': 'Debe ser un valor booleano (true/false)'})
        elif setting_type == 'JSON':
            try:
                json.loads(value)
            except Exception:
                raise serializers.ValidationError({'value': 'Debe ser un JSON válido'})
        # STRING no requiere validación extra
        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['typed_value'] = instance.get_typed_value()
        return data 