
from .models import DisciplinaryRecord


class DisciplinaryRecordSerializer(serializers.ModelSerializer):
    """Serializer para registros disciplinarios"""
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    severity_color = serializers.ReadOnlyField()
    is_recent = serializers.ReadOnlyField()
    
    class Meta:
        model = DisciplinaryRecord
        fields = [
            'id', 'student', 'student_name', 'company', 'company_name',
            'incident_date', 'description', 'action_taken', 'severity',
            'severity_display', 'severity_color', 'recorded_by', 'recorded_by_name',
            'recorded_at', 'is_recent'
        ]
        read_only_fields = ['recorded_by', 'recorded_at']

    def validate(self, data):
        """Validación personalizada"""
        # Verificar que la fecha del incidente no sea futura
        incident_date = data.get('incident_date')
        if incident_date:
            from django.utils import timezone
            if incident_date > timezone.now().date():
                raise serializers.ValidationError(
                    "La fecha del incidente no puede ser futura."
                )
        
        # Verificar que el estudiante pertenezca a la empresa
        student = data.get('student')
        company = data.get('company')
        if student and company:
            # Aquí podrías agregar lógica para verificar la relación estudiante-empresa
            pass
        
        return data

    def create(self, validated_data):
        """Crear registro disciplinario"""
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)


class DisciplinaryRecordListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar registros disciplinarios"""
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    severity_color = serializers.ReadOnlyField()
    is_recent = serializers.ReadOnlyField()
    
    class Meta:
        model = DisciplinaryRecord
        fields = [
            'id', 'student_name', 'company_name', 'incident_date',
            'description', 'severity', 'severity_display', 'severity_color',
            'is_recent', 'recorded_at'
        ]


class DisciplinaryRecordStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de registros disciplinarios"""
    total_records = serializers.IntegerField()
    records_this_month = serializers.IntegerField()
    records_this_year = serializers.IntegerField()
    critical_records = serializers.IntegerField()
    high_records = serializers.IntegerField()
    medium_records = serializers.IntegerField()
    low_records = serializers.IntegerField()
    students_with_records = serializers.IntegerField()
    companies_with_records = serializers.IntegerField()
    average_records_per_student = serializers.FloatField()
    average_records_per_company = serializers.FloatField()


class DisciplinaryRecordByStudentSerializer(serializers.Serializer):
    """Serializer para registros disciplinarios por estudiante"""
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    total_records = serializers.IntegerField()
    critical_records = serializers.IntegerField()
    high_records = serializers.IntegerField()
    medium_records = serializers.IntegerField()
    low_records = serializers.IntegerField()
    last_incident_date = serializers.DateField(required=False)
    company_name = serializers.CharField(required=False)


class DisciplinaryRecordByCompanySerializer(serializers.Serializer):
    """Serializer para registros disciplinarios por empresa"""
    company_id = serializers.IntegerField()
    company_name = serializers.CharField()
    total_records = serializers.IntegerField()
    critical_records = serializers.IntegerField()
    high_records = serializers.IntegerField()
    medium_records = serializers.IntegerField()
    low_records = serializers.IntegerField()
    students_involved = serializers.IntegerField()
    last_incident_date = serializers.DateField(required=False) 