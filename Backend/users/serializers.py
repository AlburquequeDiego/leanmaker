from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UsuarioSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField(help_text="Nombre completo del usuario")
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'first_name', 'last_name', 'username', 'phone',
            'avatar', 'bio', 'role', 'is_active', 'is_verified', 'is_staff', 'is_superuser', 'full_name',
            'date_joined', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def to_representation(self, instance):
        """Asegurar que el ID sea string (UUID)"""
        data = super().to_representation(instance)
        data['id'] = str(instance.id)
        return data

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
    
    # Campos adicionales del registro
    birthdate = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    # Campos específicos de estudiante
    career = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    university = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    education_level = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    # Campos específicos de empresa
    rut = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    personality = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    business_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    company_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    company_address = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    company_phone = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    company_email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    
    # Campos del usuario responsable (empresa)
    responsible_first_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    responsible_last_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    responsible_email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    responsible_phone = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    responsible_birthdate = serializers.DateField(required=False, allow_null=True)
    responsible_gender = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    responsible_password = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    responsible_password_confirm = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = Usuario
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'username', 'phone', 'role', 'birthdate', 'gender',
            'career', 'university', 'education_level',
            'rut', 'personality', 'business_name', 'company_name', 'company_address', 
            'company_phone', 'company_email',
            'responsible_first_name', 'responsible_last_name', 'responsible_email',
            'responsible_phone', 'responsible_birthdate', 'responsible_gender',
            'responsible_password', 'responsible_password_confirm'
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
        # Extraer campos específicos
        password = validated_data.pop('password')
        password_confirm = validated_data.pop('password_confirm')
        
        # Campos específicos de estudiante
        career = validated_data.pop('career', None)
        university = validated_data.pop('university', None)
        education_level = validated_data.pop('education_level', None)
        
        # Campos específicos de empresa
        rut = validated_data.pop('rut', None)
        personality = validated_data.pop('personality', None)
        business_name = validated_data.pop('business_name', None)
        company_name = validated_data.pop('company_name', None)
        company_address = validated_data.pop('company_address', None)
        company_phone = validated_data.pop('company_phone', None)
        company_email = validated_data.pop('company_email', None)
        
        # Campos del usuario responsable
        responsible_first_name = validated_data.pop('responsible_first_name', None)
        responsible_last_name = validated_data.pop('responsible_last_name', None)
        responsible_email = validated_data.pop('responsible_email', None)
        responsible_phone = validated_data.pop('responsible_phone', None)
        responsible_birthdate = validated_data.pop('responsible_birthdate', None)
        responsible_gender = validated_data.pop('responsible_gender', None)
        responsible_password = validated_data.pop('responsible_password', None)
        responsible_password_confirm = validated_data.pop('responsible_password_confirm', None)
        
        # Crear el usuario
        user = Usuario.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Crear perfil específico según el rol
        if user.role == 'student':
            from students.models import Estudiante
            Estudiante.objects.create(
                user=user,
                career=career,
                university=university,
                education_level=education_level,
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
            from companies.models import Empresa, UsuarioResponsable
            empresa = Empresa.objects.create(
                user=user,
                rut=rut,
                personality=personality,
                business_name=business_name,
                company_name=company_name,
                company_address=company_address,
                company_phone=company_phone,
                company_email=company_email,
                verified=False,
                rating=0.0,
                total_projects=0,
                projects_completed=0,
                total_hours_offered=0,
                status='active'
            )
            
            # Crear usuario responsable si se proporcionan los datos
            if responsible_first_name and responsible_last_name and responsible_email:
                UsuarioResponsable.objects.create(
                    empresa=empresa,
                    first_name=responsible_first_name,
                    last_name=responsible_last_name,
                    email=responsible_email,
                    phone=responsible_phone or '',
                    birthdate=responsible_birthdate,
                    gender=responsible_gender or '',
                    password=responsible_password or ''
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
            'avatar': self.user.avatar or '',
            'bio': self.user.bio or '',
            'role': self.user.role,
            'is_active': self.user.is_active,
            'is_verified': self.user.is_verified,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
            'date_joined': self.user.date_joined.isoformat() if self.user.date_joined else None,
            'last_login': self.user.last_login.isoformat() if self.user.last_login else None,
            'created_at': self.user.created_at.isoformat() if self.user.created_at else None,
            'updated_at': self.user.updated_at.isoformat() if self.user.updated_at else None,
            'full_name': self.user.full_name,
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
            'first_name': self.user.first_name or '',
            'last_name': self.user.last_name or '',
            'username': self.user.username or '',
            'phone': self.user.phone or '',
            'avatar': self.user.avatar or '',
            'bio': self.user.bio or '',
            'role': self.user.role,
            'is_active': self.user.is_active,
            'is_verified': self.user.is_verified,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
            'date_joined': self.user.date_joined.isoformat() if self.user.date_joined else None,
            'last_login': self.user.last_login.isoformat() if self.user.last_login else None,
            'created_at': self.user.created_at.isoformat() if self.user.created_at else None,
            'updated_at': self.user.updated_at.isoformat() if self.user.updated_at else None,
            'full_name': self.user.full_name,
        }
        
        return data 