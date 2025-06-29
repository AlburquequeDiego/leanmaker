from rest_framework import serializers
from django.db.models import Q, Count, Avg
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models.functions import Greatest
from users.models import Usuario
from companies.models import Empresa
from projects.models import Proyecto
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer
from evaluations.serializers import StudentSkillSerializer

class SearchQuerySerializer(serializers.Serializer):
    """Serializer para consultas de búsqueda"""
    query = serializers.CharField(max_length=500, help_text="Término de búsqueda")
    search_type = serializers.ChoiceField(
        choices=[
            ('all', 'Todo'),
            ('students', 'Estudiantes'),
            ('projects', 'Proyectos'),
            ('companies', 'Empresas'),
            ('skills', 'Habilidades')
        ],
        default='all',
        help_text="Tipo de búsqueda"
    )
    filters = serializers.DictField(
        required=False,
        help_text="Filtros adicionales para la búsqueda"
    )
    page = serializers.IntegerField(min_value=1, default=1, help_text="Número de página")
    page_size = serializers.IntegerField(min_value=1, max_value=100, default=20, help_text="Tamaño de página")
    sort_by = serializers.ChoiceField(
        choices=[
            ('relevance', 'Relevancia'),
            ('date', 'Fecha'),
            ('name', 'Nombre'),
            ('rating', 'Calificación'),
            ('popularity', 'Popularidad')
        ],
        default='relevance',
        help_text="Criterio de ordenamiento"
    )
    sort_order = serializers.ChoiceField(
        choices=[('asc', 'Ascendente'), ('desc', 'Descendente')],
        default='desc',
        help_text="Orden de clasificación"
    )
    
    def validate(self, attrs):
        query = attrs.get('query', '').strip()
        if not query:
            raise serializers.ValidationError("El término de búsqueda no puede estar vacío.")
        
        if len(query) < 2:
            raise serializers.ValidationError("El término de búsqueda debe tener al menos 2 caracteres.")
        
        return attrs

class StudentSearchResultSerializer(serializers.Serializer):
    """Serializer para resultados de búsqueda de estudiantes"""
    student = UserSerializer()
    relevance_score = serializers.FloatField()
    matched_fields = serializers.ListField(child=serializers.CharField())
    skills = StudentSkillSerializer(many=True)
    projects_count = serializers.IntegerField()
    average_rating = serializers.FloatField()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas del estudiante
        student = instance['student']
        data['projects_count'] = student.completed_projects
        data['average_rating'] = 0.0  # Calcular promedio de evaluaciones
        
        # Obtener habilidades del estudiante
        skills = student.skills.all()[:5]  # Solo las primeras 5 habilidades
        data['skills'] = StudentSkillSerializer(skills, many=True).data
        
        return data

class ProjectSearchResultSerializer(serializers.Serializer):
    """Serializer para resultados de búsqueda de proyectos"""
    project = ProjectSerializer()
    relevance_score = serializers.FloatField()
    matched_fields = serializers.ListField(child=serializers.CharField())
    applications_count = serializers.IntegerField()
    company_rating = serializers.FloatField()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas del proyecto
        project = instance['project']
        data['applications_count'] = project.applications.count()
        data['company_rating'] = project.company.company_rating or 0.0
        
        return data

class CompanySearchResultSerializer(serializers.Serializer):
    """Serializer para resultados de búsqueda de empresas"""
    company = UserSerializer()
    relevance_score = serializers.FloatField()
    matched_fields = serializers.ListField(child=serializers.CharField())
    projects_count = serializers.IntegerField()
    active_projects_count = serializers.IntegerField()
    average_rating = serializers.FloatField()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas de la empresa
        company = instance['company']
        data['projects_count'] = company.company_projects.count()
        data['active_projects_count'] = company.company_projects.filter(status='published').count()
        data['average_rating'] = company.company_rating or 0.0
        
        return data

class SkillSearchResultSerializer(serializers.Serializer):
    """Serializer para resultados de búsqueda de habilidades"""
    skill_name = serializers.CharField()
    relevance_score = serializers.FloatField()
    students_count = serializers.IntegerField()
    projects_count = serializers.IntegerField()
    average_level = serializers.FloatField()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas de la habilidad
        skill_name = instance['skill_name']
        from evaluations.models import StudentSkill
        from projects.models import Project
        
        students_with_skill = StudentSkill.objects.filter(skill_name__icontains=skill_name)
        projects_with_skill = Project.objects.filter(required_skills__icontains=skill_name)
        
        data['students_count'] = students_with_skill.count()
        data['projects_count'] = projects_with_skill.count()
        
        # Calcular nivel promedio
        levels = students_with_skill.values_list('level', flat=True)
        data['average_level'] = sum(levels) / len(levels) if levels else 0.0
        
        return data

class SearchResultSerializer(serializers.Serializer):
    """Serializer para resultados generales de búsqueda"""
    query = serializers.CharField()
    total_results = serializers.IntegerField()
    search_time_ms = serializers.FloatField()
    students = StudentSearchResultSerializer(many=True)
    projects = ProjectSearchResultSerializer(many=True)
    companies = CompanySearchResultSerializer(many=True)
    skills = SkillSearchResultSerializer(many=True)
    suggestions = serializers.ListField(child=serializers.CharField())
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Generar sugerencias de búsqueda
        query = instance.get('query', '')
        suggestions = self.generate_suggestions(query)
        data['suggestions'] = suggestions
        
        return data
    
    def generate_suggestions(self, query):
        """Generar sugerencias de búsqueda basadas en la consulta"""
        suggestions = []
        
        # Sugerencias simples basadas en la consulta
        if 'proyecto' in query.lower():
            suggestions.extend(['proyectos web', 'proyectos móviles', 'proyectos de IA'])
        elif 'estudiante' in query.lower():
            suggestions.extend(['estudiantes de ingeniería', 'estudiantes de diseño'])
        elif 'empresa' in query.lower():
            suggestions.extend(['empresas tecnológicas', 'empresas de consultoría'])
        
        return suggestions[:5]  # Máximo 5 sugerencias

class AdvancedSearchSerializer(serializers.Serializer):
    """Serializer para búsqueda avanzada"""
    # Filtros de estudiantes
    student_career = serializers.CharField(required=False)
    student_semester = serializers.IntegerField(min_value=1, max_value=12, required=False)
    student_gpa_min = serializers.FloatField(min_value=0.0, max_value=5.0, required=False)
    student_gpa_max = serializers.FloatField(min_value=0.0, max_value=5.0, required=False)
    student_api_level_min = serializers.IntegerField(min_value=1, max_value=5, required=False)
    student_api_level_max = serializers.IntegerField(min_value=1, max_value=5, required=False)
    student_skills = serializers.ListField(child=serializers.CharField(), required=False)
    
    # Filtros de proyectos
    project_area = serializers.CharField(required=False)
    project_modality = serializers.ChoiceField(
        choices=[('remote', 'Remoto'), ('onsite', 'Presencial'), ('hybrid', 'Híbrido')],
        required=False
    )
    project_difficulty = serializers.ChoiceField(
        choices=[('beginner', 'Básico'), ('intermediate', 'Intermedio'), ('advanced', 'Avanzado')],
        required=False
    )
    project_is_paid = serializers.BooleanField(required=False)
    project_payment_min = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    project_payment_max = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    # Filtros de empresas
    company_size = serializers.ChoiceField(
        choices=[('startup', 'Startup'), ('small', 'Pequeña'), ('medium', 'Mediana'), ('large', 'Grande')],
        required=False
    )
    company_industry = serializers.CharField(required=False)
    company_location = serializers.CharField(required=False)
    company_rating_min = serializers.FloatField(min_value=0.0, max_value=5.0, required=False)
    
    # Filtros generales
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    is_verified = serializers.BooleanField(required=False)
    
    def validate(self, attrs):
        # Validar rangos de GPA
        gpa_min = attrs.get('student_gpa_min')
        gpa_max = attrs.get('student_gpa_max')
        if gpa_min and gpa_max and gpa_min > gpa_max:
            raise serializers.ValidationError("El GPA mínimo no puede ser mayor al GPA máximo.")
        
        # Validar rangos de API level
        api_min = attrs.get('student_api_level_min')
        api_max = attrs.get('student_api_level_max')
        if api_min and api_max and api_min > api_max:
            raise serializers.ValidationError("El nivel de API mínimo no puede ser mayor al máximo.")
        
        # Validar rangos de pago
        payment_min = attrs.get('project_payment_min')
        payment_max = attrs.get('project_payment_max')
        if payment_min and payment_max and payment_min > payment_max:
            raise serializers.ValidationError("El pago mínimo no puede ser mayor al pago máximo.")
        
        # Validar fechas
        date_from = attrs.get('date_from')
        date_to = attrs.get('date_to')
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError("La fecha de inicio no puede ser posterior a la fecha de fin.")
        
        return attrs

class SearchFilterSerializer(serializers.Serializer):
    """Serializer para filtros de búsqueda"""
    name = serializers.CharField()
    type = serializers.ChoiceField(choices=['text', 'select', 'range', 'checkbox', 'date'])
    label = serializers.CharField()
    options = serializers.ListField(child=serializers.DictField(), required=False)
    min_value = serializers.FloatField(required=False)
    max_value = serializers.FloatField(required=False)
    step = serializers.FloatField(required=False)
    placeholder = serializers.CharField(required=False)
    help_text = serializers.CharField(required=False)

class SearchSuggestionSerializer(serializers.Serializer):
    """Serializer para sugerencias de búsqueda"""
    text = serializers.CharField()
    type = serializers.ChoiceField(choices=['query', 'filter', 'category'])
    relevance = serializers.FloatField()
    count = serializers.IntegerField(required=False)

class SearchHistorySerializer(serializers.Serializer):
    """Serializer para historial de búsquedas"""
    query = serializers.CharField()
    search_type = serializers.CharField()
    results_count = serializers.IntegerField()
    search_date = serializers.DateTimeField()
    filters_used = serializers.DictField(required=False)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Formatear la fecha de búsqueda
        from django.utils import timezone
        if isinstance(data['search_date'], str):
            data['search_date'] = timezone.now().isoformat()
        
        return data

class SearchAnalyticsSerializer(serializers.Serializer):
    """Serializer para análisis de búsquedas"""
    total_searches = serializers.IntegerField()
    unique_users = serializers.IntegerField()
    average_results = serializers.FloatField()
    most_popular_queries = serializers.ListField()
    search_trends = serializers.DictField()
    zero_results_queries = serializers.ListField()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Simular datos de análisis
        data['most_popular_queries'] = [
            {'query': 'proyectos web', 'count': 150},
            {'query': 'estudiantes de ingeniería', 'count': 120},
            {'query': 'empresas tecnológicas', 'count': 80},
            {'query': 'React', 'count': 65},
            {'query': 'Python', 'count': 55}
        ]
        
        data['search_trends'] = {
            'daily': {'2024-01-01': 45, '2024-01-02': 52, '2024-01-03': 48},
            'weekly': {'week1': 320, 'week2': 345, 'week3': 310},
            'monthly': {'january': 1200, 'february': 1350, 'march': 1280}
        }
        
        data['zero_results_queries'] = [
            'proyectos de unicornios',
            'estudiantes de magia',
            'empresas de viajes espaciales'
        ]
        
        return data 
