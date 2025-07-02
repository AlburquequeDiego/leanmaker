from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UsuarioSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'first_name', 'last_name', 'username', 'phone',
            'avatar', 'bio', 'role', 'is_active', 'is_verified', 'full_name',
            'date_joined', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

# Alias para compatibilidad
UserSerializer = UsuarioSerializer

class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'username', 'phone', 'role'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = Usuario.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UsuarioUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'first_name', 'last_name', 'username', 'phone', 'avatar', 'bio'
        ]

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'username', 'phone', 'role'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        
        # Validar que el email no exista
        if Usuario.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("Este email ya está registrado")
        
        # Validar que el username no exista si se proporciona
        if attrs.get('username') and Usuario.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso")
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Crear el usuario
        user = Usuario.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Crear perfil específico según el rol
        if user.role == 'student':
            from students.models import Estudiante
            Estudiante.objects.create(
                user=user,
                status='pending',
                api_level=1,
                strikes=0,
                gpa=0.0,
                completed_projects=0,
                total_hours=0,
                experience_years=0,
                rating=0.0
            )
        elif user.role == 'company':
            from companies.models import Empresa
            Empresa.objects.create(
                user=user,
                verified=False,
                rating=0.0,
                total_projects=0,
                projects_completed=0,
                total_hours_offered=0,
                status='active'
            )
        
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('Credenciales inválidas')
            if not user.is_active:
                raise serializers.ValidationError('Usuario inactivo')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Email y contraseña son requeridos')
        
        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Contraseña actual incorrecta')
        return value

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer personalizado para JWT que usa email en vez de username"""
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Renombrar el campo username a email
        if 'username' in self.fields:
            self.fields['email'] = self.fields.pop('username')
    
    def validate(self, attrs):
        # Asegurar que siempre usamos 'email' como campo de autenticación
        if 'username' in attrs:
            attrs['email'] = attrs.pop('username')
        
        # Validar que el email existe
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Intentar autenticar con email
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('Credenciales inválidas')
            if not user.is_active:
                raise serializers.ValidationError('Usuario inactivo')
            
            # Asignar el usuario autenticado
            self.user = user
        else:
            raise serializers.ValidationError('Email y contraseña son requeridos')
        
        # Generar tokens usando el método del padre
        data = super().validate(attrs)
        
        # Agregar información completa del usuario
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'first_name': self.user.first_name or '',
            'last_name': self.user.last_name or '',
            'username': self.user.username or '',
            'phone': self.user.phone or '',
            'avatar': self.user.avatar.url if self.user.avatar else None,
            'bio': self.user.bio or '',
            'role': self.user.role,
            'is_active': self.user.is_active,
            'is_verified': self.user.is_verified,
            'date_joined': self.user.date_joined.isoformat() if self.user.date_joined else None,
            'last_login': self.user.last_login.isoformat() if self.user.last_login else None,
        }
        
        return data

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Asegurar que el campo se llame 'email' en el formulario
        self.fields['email'] = self.fields.pop('username', None)
    
    def validate(self, attrs):
        # Asegurar que siempre usamos 'email' como campo de autenticación
        if 'username' in attrs:
            attrs['email'] = attrs.pop('username')
        
        # Validar que el email existe
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Intentar autenticar con email
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('Credenciales inválidas')
            if not user.is_active:
                raise serializers.ValidationError('Usuario inactivo')
            
            # Asignar el usuario autenticado
            self.user = user
        else:
            raise serializers.ValidationError('Email y contraseña son requeridos')
        
        # Generar tokens
        refresh = self.get_token(self.user)
        access = refresh.access_token
        
        data = {
            'refresh': str(refresh),
            'access': str(access),
        }
        
        # Agregar información adicional del usuario al token
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'is_active': self.user.is_active,
            'is_verified': self.user.is_verified
        }
        
        return data 