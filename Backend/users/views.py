from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from .models import Usuario
from .serializers import (
    UsuarioSerializer, UsuarioCreateSerializer, UsuarioUpdateSerializer,
    LoginSerializer, ChangePasswordSerializer, UserRegistrationSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.filter(is_active=True)
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_verified']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering_fields = ['date_joined', 'last_login', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        return UsuarioSerializer

    def get_permissions(self):
        if self.action in ['create', 'list']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Usuario.objects.all()
        return Usuario.objects.filter(id=user.id)

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': 'Login exitoso',
                'user': UsuarioSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Logout exitoso'})

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Contraseña cambiada exitosamente'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        user = self.get_object()
        user.is_verified = True
        user.save()
        return Response({'message': 'Usuario verificado'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message': 'Usuario desactivado'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Obtener perfil del usuario actual"""
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def admin_dashboard_stats(self, request):
        """Estadísticas para el dashboard de administrador"""
        if not request.user.is_superuser:
            return Response({'error': 'Acceso denegado'}, status=status.HTTP_403_FORBIDDEN)
        
        total_users = Usuario.objects.count()
        active_users = Usuario.objects.filter(is_active=True).count()
        verified_users = Usuario.objects.filter(is_verified=True).count()
        students = Usuario.objects.filter(role='student').count()
        companies = Usuario.objects.filter(role='company').count()
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'verified_users': verified_users,
            'students': students,
            'companies': companies,
        })

    @action(detail=False, methods=['get'])
    def user_activity_chart(self, request):
        """Datos para gráfico de actividad de usuarios"""
        if not request.user.is_superuser:
            return Response({'error': 'Acceso denegado'}, status=status.HTTP_403_FORBIDDEN)
        
        # Implementar lógica de gráfico de actividad
        return Response({
            'chart_data': []
        })

class AuthViewSet(viewsets.ViewSet):
    """ViewSet para autenticación"""
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': 'Login exitoso',
                'user': UsuarioSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Logout exitoso'})

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': UsuarioSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordViewSet(viewsets.ViewSet):
    """ViewSet para gestión de contraseñas"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'Contraseña cambiada exitosamente'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        # Implementar lógica de reset de contraseña
        return Response({'message': 'Funcionalidad en desarrollo'})

class DashboardViewSet(viewsets.ViewSet):
    """ViewSet para dashboard"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas del dashboard según el rol del usuario"""
        user = request.user
        
        if user.es_admin:
            return self._admin_stats()
        elif user.es_estudiante:
            return self._student_stats(user)
        elif user.es_empresa:
            return self._company_stats(user)
        
        return Response({'error': 'Rol no reconocido'}, status=status.HTTP_400_BAD_REQUEST)

    def _admin_stats(self):
        """Estadísticas para administradores"""
        total_users = Usuario.objects.count()
        active_users = Usuario.objects.filter(is_active=True).count()
        students = Usuario.objects.filter(role='student').count()
        companies = Usuario.objects.filter(role='company').count()
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'students': students,
            'companies': companies,
        })

    def _student_stats(self, user):
        """Estadísticas para estudiantes"""
        try:
            estudiante = user.estudiante_profile
            return Response({
                'strikes': estudiante.strikes,
                'gpa': float(estudiante.gpa),
                'completed_projects': estudiante.completed_projects,
                'total_hours': estudiante.total_hours,
                'rating': float(estudiante.rating),
            })
        except:
            return Response({
                'strikes': 0,
                'gpa': 0.0,
                'completed_projects': 0,
                'total_hours': 0,
                'rating': 0.0,
            })

    def _company_stats(self, user):
        """Estadísticas para empresas"""
        try:
            empresa = user.empresa_profile
            return Response({
                'rating': float(empresa.rating),
                'total_projects': empresa.total_projects,
                'projects_completed': empresa.projects_completed,
                'total_hours_offered': empresa.total_hours_offered,
            })
        except:
            return Response({
                'rating': 0.0,
                'total_projects': 0,
                'projects_completed': 0,
                'total_hours_offered': 0,
            })

class UserRegistrationView(APIView):
    """Vista para registro de usuarios"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': UsuarioSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 