from rest_framework import serializers
from .models import APIEndpoint, APIRequest, APIResponse, APITest, APIVersion, APIDocumentation
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer

class APIEndpointSerializer(serializers.ModelSerializer):
    """Serializer básico para endpoints de API"""
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    version_name = serializers.CharField(source='version.version_name', read_only=True)
    
    class Meta:
        model = APIEndpoint
        fields = [
            'id', 'name', 'description', 'url', 'method', 'version', 'version_name',
            'creator', 'creator_name', 'is_active', 'is_public', 'rate_limit',
            'authentication_required', 'permissions_required', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        # Validar que el método HTTP sea válido
        method = attrs.get('method')
        if method and method not in dict(APIEndpoint.METHOD_CHOICES):
            raise serializers.ValidationError("Método HTTP inválido.")
        
        # Validar que la URL sea válida
        url = attrs.get('url')
        if url and not url.startswith('/'):
            raise serializers.ValidationError("La URL debe comenzar con '/'.")
        
        # Validar que el límite de tasa sea razonable
        rate_limit = attrs.get('rate_limit')
        if rate_limit and rate_limit <= 0:
            raise serializers.ValidationError("El límite de tasa debe ser un número positivo.")
        
        return attrs

class APIEndpointCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear endpoints de API"""
    
    class Meta:
        model = APIEndpoint
        fields = ['name', 'description', 'url', 'method', 'version', 'is_active', 'is_public', 'rate_limit', 'authentication_required', 'permissions_required']
    
    def validate(self, attrs):
        # Validaciones similares a APIEndpointSerializer
        method = attrs.get('method')
        if method and method not in dict(APIEndpoint.METHOD_CHOICES):
            raise serializers.ValidationError("Método HTTP inválido.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)

class APIRequestSerializer(serializers.ModelSerializer):
    """Serializer básico para solicitudes de API"""
    endpoint_name = serializers.CharField(source='endpoint.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    response_status = serializers.CharField(source='response.status_code', read_only=True)
    
    class Meta:
        model = APIRequest
        fields = [
            'id', 'endpoint', 'endpoint_name', 'user', 'user_name', 'request_data',
            'headers', 'ip_address', 'user_agent', 'response_status', 'created_at',
            'response_time_ms', 'is_successful'
        ]
        read_only_fields = ['id', 'created_at', 'response_time_ms', 'is_successful']

class APIRequestDetailSerializer(APIRequestSerializer):
    """Serializer detallado para solicitudes de API"""
    endpoint_details = APIEndpointSerializer(source='endpoint', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    response_details = serializers.SerializerMethodField()
    
    class Meta(APIRequestSerializer.Meta):
        fields = APIRequestSerializer.Meta.fields + ['endpoint_details', 'user_details', 'response_details']
    
    def get_response_details(self, obj):
        if hasattr(obj, 'response'):
            return APIResponseSerializer(obj.response).data
        return None

class APIResponseSerializer(serializers.ModelSerializer):
    """Serializer para respuestas de API"""
    
    class Meta:
        model = APIResponse
        fields = [
            'id', 'request', 'status_code', 'response_data', 'headers',
            'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class APITestSerializer(serializers.ModelSerializer):
    """Serializer básico para pruebas de API"""
    endpoint_name = serializers.CharField(source='endpoint.name', read_only=True)
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    
    class Meta:
        model = APITest
        fields = [
            'id', 'name', 'description', 'endpoint', 'endpoint_name', 'creator',
            'creator_name', 'test_data', 'expected_response', 'is_active',
            'last_run', 'last_result', 'success_rate', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_run', 'last_result', 'success_rate', 'created_at', 'updated_at']

class APITestCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear pruebas de API"""
    
    class Meta:
        model = APITest
        fields = ['name', 'description', 'endpoint', 'test_data', 'expected_response', 'is_active']
    
    def validate(self, attrs):
        # Verificar que el endpoint esté activo
        endpoint = attrs.get('endpoint')
        if endpoint and not endpoint.is_active:
            raise serializers.ValidationError("Solo se pueden crear pruebas para endpoints activos.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)

class APITestRunSerializer(serializers.Serializer):
    """Serializer para ejecutar pruebas de API"""
    test_id = serializers.UUIDField()
    run_async = serializers.BooleanField(default=False)
    
    def validate_test_id(self, value):
        try:
            test = APITest.objects.get(id=value)
            if not test.is_active:
                raise serializers.ValidationError("La prueba no está activa.")
        except APITest.DoesNotExist:
            raise serializers.ValidationError("Prueba no encontrada.")
        
        return value

class APIVersionSerializer(serializers.ModelSerializer):
    """Serializer básico para versiones de API"""
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    endpoints_count = serializers.SerializerMethodField()
    
    class Meta:
        model = APIVersion
        fields = [
            'id', 'version_name', 'description', 'creator', 'creator_name',
            'is_active', 'is_deprecated', 'release_date', 'end_of_life_date',
            'endpoints_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'endpoints_count']
    
    def get_endpoints_count(self, obj):
        return obj.endpoints.count()

class APIVersionCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear versiones de API"""
    
    class Meta:
        model = APIVersion
        fields = ['version_name', 'description', 'is_active', 'is_deprecated', 'release_date', 'end_of_life_date']
    
    def validate(self, attrs):
        # Validar que el nombre de versión sea único
        version_name = attrs.get('version_name')
        if version_name and APIVersion.objects.filter(version_name=version_name).exists():
            raise serializers.ValidationError("Ya existe una versión con este nombre.")
        
        # Validar que las fechas sean coherentes
        release_date = attrs.get('release_date')
        end_of_life_date = attrs.get('end_of_life_date')
        if release_date and end_of_life_date and release_date >= end_of_life_date:
            raise serializers.ValidationError("La fecha de lanzamiento debe ser anterior a la fecha de fin de vida.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)

class APIDocumentationSerializer(serializers.ModelSerializer):
    """Serializer básico para documentación de API"""
    endpoint_name = serializers.CharField(source='endpoint.name', read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = APIDocumentation
        fields = [
            'id', 'endpoint', 'endpoint_name', 'title', 'content', 'author',
            'author_name', 'version', 'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class APIDocumentationCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear documentación de API"""
    
    class Meta:
        model = APIDocumentation
        fields = ['endpoint', 'title', 'content', 'version', 'is_public']
    
    def validate(self, attrs):
        # Verificar que el endpoint esté activo
        endpoint = attrs.get('endpoint')
        if endpoint and not endpoint.is_active:
            raise serializers.ValidationError("Solo se puede crear documentación para endpoints activos.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class APIStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de API"""
    total_endpoints = serializers.IntegerField()
    active_endpoints = serializers.IntegerField()
    total_requests = serializers.IntegerField()
    successful_requests = serializers.IntegerField()
    failed_requests = serializers.IntegerField()
    average_response_time = serializers.FloatField()
    requests_by_method = serializers.DictField()
    requests_by_endpoint = serializers.DictField()
    recent_requests = APIRequestSerializer(many=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas por método
        requests = APIRequest.objects.all()
        method_stats = {}
        
        for method, _ in APIEndpoint.METHOD_CHOICES:
            method_requests = requests.filter(endpoint__method=method)
            if method_requests.exists():
                method_stats[method] = method_requests.count()
        
        data['requests_by_method'] = method_stats
        
        # Calcular estadísticas por endpoint
        endpoint_stats = {}
        for request in requests[:10]:  # Solo los primeros 10 endpoints más usados
            endpoint_name = request.endpoint.name
            if endpoint_name not in endpoint_stats:
                endpoint_stats[endpoint_name] = 0
            endpoint_stats[endpoint_name] += 1
        
        data['requests_by_endpoint'] = endpoint_stats
        return data

class APIHealthSerializer(serializers.Serializer):
    """Serializer para salud de la API"""
    overall_status = serializers.CharField()
    endpoints_status = serializers.DictField()
    uptime_percentage = serializers.FloatField()
    average_response_time = serializers.FloatField()
    error_rate = serializers.FloatField()
    last_check = serializers.DateTimeField()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Simular métricas de salud de la API
        from django.utils import timezone
        
        endpoints_status = {}
        for endpoint in APIEndpoint.objects.filter(is_active=True):
            endpoints_status[endpoint.name] = {
                'status': 'healthy',
                'response_time': '150ms',
                'availability': '99.9%'
            }
        
        data.update({
            'overall_status': 'healthy',
            'endpoints_status': endpoints_status,
            'uptime_percentage': 99.9,
            'average_response_time': 150.0,
            'error_rate': 0.1,
            'last_check': timezone.now()
        })
        
        return data

class APIUsageSerializer(serializers.Serializer):
    """Serializer para uso de la API"""
    user = UserSerializer()
    total_requests = serializers.IntegerField()
    successful_requests = serializers.IntegerField()
    failed_requests = serializers.IntegerField()
    average_response_time = serializers.FloatField()
    requests_by_endpoint = serializers.DictField()
    recent_activity = serializers.ListField()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Calcular estadísticas de uso del usuario
        user_requests = APIRequest.objects.filter(user=instance)
        total_requests = user_requests.count()
        successful_requests = user_requests.filter(is_successful=True).count()
        failed_requests = total_requests - successful_requests
        
        # Calcular tiempo promedio de respuesta
        response_times = user_requests.values_list('response_time_ms', flat=True)
        average_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Calcular solicitudes por endpoint
        requests_by_endpoint = {}
        for request in user_requests[:10]:
            endpoint_name = request.endpoint.name
            if endpoint_name not in requests_by_endpoint:
                requests_by_endpoint[endpoint_name] = 0
            requests_by_endpoint[endpoint_name] += 1
        
        data.update({
            'total_requests': total_requests,
            'successful_requests': successful_requests,
            'failed_requests': failed_requests,
            'average_response_time': average_response_time,
            'requests_by_endpoint': requests_by_endpoint
        })
        
        return data 
