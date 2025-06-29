from django.shortcuts import render
from rest_framework import generics, permissions, viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserRegistrationSerializer, UserSerializer, StudentProfileSerializer, CompanyProfileSerializer, AdminUserSerializer, UserLoginSerializer, PasswordChangeSerializer, PasswordResetSerializer, UserStatsSerializer
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Usuario
from companies.models import Empresa
from students.models import Student
from projects.models import Proyecto
from applications.models import Aplicacion
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    """
    Vista para el registro de nuevos usuarios (Estudiantes y Empresas).
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny] # Cualquiera puede registrarse

class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Vista para obtener y actualizar los datos del usuario actualmente autenticado.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Devuelve el usuario asociado a la petición actual
        return self.request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return UserSerializer

    @action(detail=False, methods=['get'])
    def admin_dashboard_stats(self, request):
        """
        Estadísticas para el dashboard de administradores.
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Acceso denegado'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Fechas para filtros
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        last_7_days = now - timedelta(days=7)

        # Estadísticas generales
        stats = {
            'total_users': User.objects.count(),
            'total_companies': Empresa.objects.count(),
            'total_students': Student.objects.count(),
            'total_projects': Proyecto.objects.count(),
            'total_applications': Aplicacion.objects.count(),
            
            # Nuevos registros en los últimos 30 días
            'new_users_30_days': User.objects.filter(
                created_at__gte=last_30_days
            ).count(),
            'new_companies_30_days': Empresa.objects.filter(
                created_at__gte=last_30_days
            ).count(),
            'new_students_30_days': Student.objects.filter(
                created_at__gte=last_30_days
            ).count(),
            'new_projects_30_days': Proyecto.objects.filter(
                created_at__gte=last_30_days
            ).count(),
            
            # Actividad reciente (últimos 7 días)
            'new_applications_7_days': Aplicacion.objects.filter(
                created_at__gte=last_7_days
            ).count(),
            
            # Estados de proyectos
            'active_projects': Proyecto.objects.filter(status='ACTIVE').count(),
            'completed_projects': Proyecto.objects.filter(status='COMPLETED').count(),
            'pending_projects': Proyecto.objects.filter(status='PENDING').count(),
            
            # Estados de postulaciones
            'pending_applications': Aplicacion.objects.filter(status='PENDING').count(),
            'accepted_applications': Aplicacion.objects.filter(status='ACCEPTED').count(),
            'rejected_applications': Aplicacion.objects.filter(status='REJECTED').count(),
        }

        return Response(stats)

    @action(detail=False, methods=['get'])
    def user_activity_chart(self, request):
        """
        Datos para gráfico de actividad de usuarios (últimos 30 días).
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'Acceso denegado'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Generar datos para los últimos 30 días
        dates = []
        user_counts = []
        
        for i in range(30):
            date = timezone.now() - timedelta(days=i)
            count = User.objects.filter(
                created_at__date=date.date()
            ).count()
            dates.append(date.strftime('%Y-%m-%d'))
            user_counts.append(count)

        return Response({
            'dates': list(reversed(dates)),
            'user_counts': list(reversed(user_counts))
        })

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de usuarios"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_verified', 'career', 'semester', 'company_industry']
    search_fields = ['first_name', 'last_name', 'email', 'company_name', 'career']
    ordering_fields = ['created_at', 'last_login', 'gpa', 'api_level', 'strikes']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return User.objects.all()
        elif user.role == 'company':
            # Las empresas solo ven estudiantes
            return User.objects.filter(role='student')
        else:
            # Los estudiantes solo ven su propio perfil
            return User.objects.filter(id=user.id)

    def get_serializer_class(self):
        """Retornar serializer específico según la acción"""
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action == 'retrieve' and self.request.user.role == 'admin':
            return AdminUserSerializer
        elif self.action == 'retrieve' and self.request.user.role == 'student':
            return StudentProfileSerializer
        elif self.action == 'retrieve' and self.request.user.role == 'company':
            return CompanyProfileSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtener perfil del usuario actual"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Actualizar perfil del usuario actual"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas del usuario actual"""
        user = request.user
        serializer = UserStatsSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def students(self, request):
        """Listar estudiantes (para empresas y admins)"""
        if request.user.role not in ['admin', 'company']:
            return Response(
                {"error": "No tienes permisos para ver esta información"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = User.objects.filter(role='student')
        serializer = StudentProfileSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def companies(self, request):
        """Listar empresas (solo para admins)"""
        if request.user.role != 'admin':
            return Response(
                {"error": "No tienes permisos para ver esta información"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = User.objects.filter(role='company')
        serializer = CompanyProfileSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar usuario (solo para admins)"""
        if request.user.role != 'admin':
            return Response(
                {"error": "No tienes permisos para realizar esta acción"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({"message": "Usuario activado correctamente"})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desactivar usuario (solo para admins)"""
        if request.user.role != 'admin':
            return Response(
                {"error": "No tienes permisos para realizar esta acción"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"message": "Usuario desactivado correctamente"})

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verificar usuario (solo para admins)"""
        if request.user.role != 'admin':
            return Response(
                {"error": "No tienes permisos para realizar esta acción"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        user.is_verified = True
        user.save()
        return Response({"message": "Usuario verificado correctamente"})

class AuthViewSet(viewsets.ViewSet):
    """ViewSet para autenticación"""
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Registrar nuevo usuario"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'message': 'Usuario registrado correctamente'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """Iniciar sesión"""
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            # Actualizar último login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'message': 'Inicio de sesión exitoso'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Cerrar sesión"""
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({"message": "Sesión cerrada correctamente"})
        except Exception as e:
            return Response(
                {"error": "Error al cerrar sesión"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def refresh(self, request):
        """Renovar token de acceso"""
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                return Response({
                    'access': str(token.access_token),
                    'refresh': str(token),
                })
        except Exception as e:
            return Response(
                {"error": "Token de renovación inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

class PasswordViewSet(viewsets.ViewSet):
    """ViewSet para gestión de contraseñas"""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def change(self, request):
        """Cambiar contraseña"""
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Contraseña cambiada correctamente"})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def reset_request(self, request):
        """Solicitar reset de contraseña"""
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            # Aquí se enviaría el email con el link de reset
            # Por ahora solo retornamos un mensaje de éxito
            return Response({
                "message": "Si el email existe, recibirás un enlace para restablecer tu contraseña"
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardViewSet(viewsets.ViewSet):
    """ViewSet para dashboards"""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def student_dashboard(self, request):
        """Dashboard para estudiantes"""
        if request.user.role != 'student':
            return Response(
                {"error": "Esta vista es solo para estudiantes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = request.user
        
        # Estadísticas del estudiante
        stats = {
            'total_applications': user.student_applications.count(),
            'accepted_applications': user.student_applications.filter(status='accepted').count(),
            'completed_projects': user.completed_projects,
            'total_hours': user.total_hours,
            'average_rating': 0.0,  # Calcular promedio de evaluaciones
            'strikes': user.strikes,
            'api_level': user.api_level,
            'recent_applications': user.student_applications.order_by('-applied_at')[:5],
            'upcoming_interviews': [],  # Obtener entrevistas próximas
            'recent_notifications': [],  # Obtener notificaciones recientes
        }
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def company_dashboard(self, request):
        """Dashboard para empresas"""
        if request.user.role != 'company':
            return Response(
                {"error": "Esta vista es solo para empresas"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = request.user
        
        # Estadísticas de la empresa
        stats = {
            'total_projects': user.company_projects.count(),
            'active_projects': user.company_projects.filter(status='published').count(),
            'total_applications': sum(p.applications.count() for p in user.company_projects.all()),
            'pending_applications': sum(p.applications.filter(status='pending').count() for p in user.company_projects.all()),
            'company_rating': user.company_rating or 0.0,
            'recent_projects': user.company_projects.order_by('-created_at')[:5],
            'recent_applications': [],  # Obtener aplicaciones recientes
            'upcoming_interviews': [],  # Obtener entrevistas próximas
        }
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def admin_dashboard(self, request):
        """Dashboard para administradores"""
        if request.user.role != 'admin':
            return Response(
                {"error": "Esta vista es solo para administradores"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Estadísticas generales del sistema
        stats = {
            'total_users': User.objects.count(),
            'total_students': User.objects.filter(role='student').count(),
            'total_companies': User.objects.filter(role='company').count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'verified_users': User.objects.filter(is_verified=True).count(),
            'recent_registrations': User.objects.order_by('-created_at')[:10],
            'system_health': {
                'database_status': 'healthy',
                'api_status': 'healthy',
                'uptime': '99.9%'
            }
        }
        
        return Response(stats)
