from rest_framework import serializers
from .models import WorkHour

class WorkHourSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    student_api_level = serializers.SerializerMethodField()
    empresa_nombre = serializers.CharField(source='company.company_name', read_only=True)
    empresa_email = serializers.CharField(source='company.user.email', read_only=True)
    is_project_completion = serializers.BooleanField(read_only=True)
    project_title = serializers.SerializerMethodField()
    integrantes = serializers.SerializerMethodField()

    class Meta:
        model = WorkHour
        fields = [
            'id', 'student', 'student_name', 'student_email', 'student_api_level', 'project', 'project_title', 'integrantes', 'company',
            'empresa_nombre', 'empresa_email',
            'date', 'hours_worked', 'description', 'approved', 'approved_by',
            'approved_at', 'created_at', 'updated_at',
            'is_project_completion'
        ]

    def get_student_name(self, obj):
        return obj.student.user.full_name if obj.student and obj.student.user else ''

    def get_student_email(self, obj):
        return obj.student.user.email if obj.student and obj.student.user else ''

    def get_student_api_level(self, obj):
        return obj.student.api_level if obj.student else None

    def get_project_title(self, obj):
        return obj.project.title if obj.project else ''

    def get_integrantes(self, obj):
        # Usar snapshot si existe
        if obj.integrantes_snapshot:
            return obj.integrantes_snapshot
        # Obtener los miembros del proyecto con rol 'estudiante' (fallback)
        miembros = []
        if obj.project:
            from projects.models import MiembroProyecto
            miembros_qs = MiembroProyecto.objects.filter(proyecto=obj.project, rol='estudiante')
            for miembro in miembros_qs:
                user = miembro.usuario
                miembros.append({
                    'nombre': user.full_name,
                    'email': user.email
                })
        return miembros 