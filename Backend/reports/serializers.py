from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    """Serializer para reportes"""
    generated_by_name = serializers.CharField(source='generated_by.full_name', read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    processing_time = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'report_type', 'title', 'description', 'generated_by', 'generated_by_name',
            'report_data', 'file_url', 'status', 'created_at', 'completed_at',
            'file_size_mb', 'processing_time', 'is_completed'
        ]
        read_only_fields = [
            'generated_by', 'created_at', 'completed_at', 'file_size_mb', 
            'processing_time', 'is_completed'
        ]

    def validate(self, data):
        """Validación personalizada"""
        # Verificar que el tipo de reporte sea válido
        valid_types = [
            'student_performance', 'company_activity', 'project_progress',
            'financial_summary', 'user_activity', 'system_usage',
            'evaluation_results', 'disciplinary_summary', 'custom'
        ]
        
        report_type = data.get('report_type')
        if report_type and report_type not in valid_types:
            raise serializers.ValidationError(
                f"Tipo de reporte no válido. Tipos permitidos: {', '.join(valid_types)}"
            )
        
        return data

    def create(self, validated_data):
        """Crear reporte y establecer usuario generador"""
        validated_data['generated_by'] = self.context['request'].user
        return super().create(validated_data)


class ReportListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar reportes"""
    generated_by_name = serializers.CharField(source='generated_by.full_name', read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    processing_time = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'report_type', 'title', 'status', 'generated_by_name',
            'file_size_mb', 'processing_time', 'is_completed', 'created_at', 'completed_at'
        ]


class ReportGenerateSerializer(serializers.Serializer):
    """Serializer para generar reportes"""
    report_type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    parameters = serializers.DictField(required=False)
    
    def validate_report_type(self, value):
        """Validar tipo de reporte"""
        valid_types = [
            'student_performance', 'company_activity', 'project_progress',
            'financial_summary', 'user_activity', 'system_usage',
            'evaluation_results', 'disciplinary_summary', 'custom'
        ]
        
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Tipo de reporte no válido. Tipos permitidos: {', '.join(valid_types)}"
            )
        return value


class ReportStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de reportes"""
    total_reports = serializers.IntegerField()
    completed_reports = serializers.IntegerField()
    pending_reports = serializers.IntegerField()
    failed_reports = serializers.IntegerField()
    reports_this_month = serializers.IntegerField()
    reports_this_year = serializers.IntegerField()
    average_processing_time = serializers.FloatField()
    reports_by_type = serializers.DictField()
    top_generators = serializers.ListField()


class ReportDownloadSerializer(serializers.Serializer):
    """Serializer para descarga de reportes"""
    report_id = serializers.IntegerField()
    format = serializers.ChoiceField(choices=['pdf', 'excel', 'csv'], default='pdf')
    
    def validate_report_id(self, value):
        """Validar que el reporte existe y está completado"""
        try:
            report = Report.objects.get(id=value)
            if not report.is_completed:
                raise serializers.ValidationError("El reporte no está completado")
        except Report.DoesNotExist:
            raise serializers.ValidationError("Reporte no encontrado")
        return value


class ReportTemplateSerializer(serializers.Serializer):
    """Serializer para plantillas de reportes"""
    name = serializers.CharField()
    report_type = serializers.CharField()
    description = serializers.CharField()
    parameters_schema = serializers.DictField()
    is_active = serializers.BooleanField(default=True) 