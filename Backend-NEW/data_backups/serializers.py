
from .models import DataBackup


class DataBackupSerializer(serializers.ModelSerializer):
    """Serializer para respaldos de datos"""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    file_size_gb = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    duration_minutes = serializers.ReadOnlyField()
    
    class Meta:
        model = DataBackup
        fields = [
            'id', 'backup_name', 'backup_type', 'file_url', 'file_size', 'file_size_mb', 'file_size_gb',
            'status', 'created_by', 'created_by_name', 'created_at', 'completed_at',
            'is_expired', 'is_completed', 'duration_minutes'
        ]
        read_only_fields = [
            'created_by', 'created_at', 'completed_at', 'file_size_mb', 
            'file_size_gb', 'is_expired', 'is_completed', 'duration_minutes'
        ]

    def validate(self, data):
        """Validación personalizada"""
        # Verificar que el tipo de respaldo sea válido
        valid_types = ['full', 'incremental', 'differential', 'schema_only', 'data_only']
        
        backup_type = data.get('backup_type')
        if backup_type and backup_type not in valid_types:
            raise serializers.ValidationError(
                f"Tipo de respaldo no válido. Tipos permitidos: {', '.join(valid_types)}"
            )
        
        return data

    def create(self, validated_data):
        """Crear respaldo y establecer usuario creador"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class DataBackupListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar respaldos"""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    duration_minutes = serializers.ReadOnlyField()
    
    class Meta:
        model = DataBackup
        fields = [
            'id', 'backup_name', 'backup_type', 'status', 'created_by_name',
            'file_size_mb', 'is_completed', 'duration_minutes', 'created_at', 'completed_at'
        ]


class DataBackupCreateSerializer(serializers.Serializer):
    """Serializer para crear respaldos"""
    backup_name = serializers.CharField()
    backup_type = serializers.CharField(default='full')
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_backup_type(self, value):
        """Validar tipo de respaldo"""
        valid_types = ['full', 'incremental', 'differential', 'schema_only', 'data_only']
        
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Tipo de respaldo no válido. Tipos permitidos: {', '.join(valid_types)}"
            )
        return value


class DataBackupStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de respaldos"""
    total_backups = serializers.IntegerField()
    completed_backups = serializers.IntegerField()
    pending_backups = serializers.IntegerField()
    failed_backups = serializers.IntegerField()
    backups_this_month = serializers.IntegerField()
    backups_this_year = serializers.IntegerField()
    total_size_mb = serializers.FloatField()
    total_size_gb = serializers.FloatField()
    average_duration_minutes = serializers.FloatField()
    backups_by_type = serializers.DictField()
    top_creators = serializers.ListField()


class DataBackupRestoreSerializer(serializers.Serializer):
    """Serializer para restaurar respaldos"""
    backup_id = serializers.IntegerField()
    restore_to_database = serializers.CharField(required=False)
    include_data = serializers.BooleanField(default=True)
    include_schema = serializers.BooleanField(default=True)
    
    def validate_backup_id(self, value):
        """Validar que el respaldo existe y está completado"""
        try:
            backup = DataBackup.objects.get(id=value)
            if not backup.is_completed:
                raise serializers.ValidationError("El respaldo no está completado")
        except DataBackup.DoesNotExist:
            raise serializers.ValidationError("Respaldo no encontrado")
        return value


class DataBackupScheduleSerializer(serializers.Serializer):
    """Serializer para programar respaldos"""
    backup_name = serializers.CharField()
    backup_type = serializers.CharField()
    schedule_type = serializers.ChoiceField(choices=['daily', 'weekly', 'monthly'])
    schedule_time = serializers.TimeField()
    schedule_day = serializers.IntegerField(required=False, min_value=1, max_value=31)
    is_active = serializers.BooleanField(default=True) 