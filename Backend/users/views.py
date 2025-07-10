from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q, Sum, Avg
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Usuario
from .serializers import (
    UsuarioSerializer, UsuarioCreateSerializer, UsuarioUpdateSerializer,
    LoginSerializer, ChangePasswordSerializer, UserRegistrationSerializer,
    CustomTokenObtainPairSerializer, EmailTokenObtainPairSerializer
)

class CustomTokenObtainPairView(TokenObtainPairView):
    """Vista personalizada para JWT que usa email en vez de username"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        """Override del método POST para mejor manejo de errores"""
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except Exception as e:
            return Response({
                'error': 'Error de autenticación',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    queryset = Usuario.objects.none()  # Para evitar problemas con drf-spectacular

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

    def get_object(self):
        """Obtener objeto o crear perfil si no existe"""
        obj = super().get_object()
        
        # Si es el usuario actual y no tiene perfil, crearlo automáticamente
        if obj == self.request.user:
            if obj.role == 'student' and not hasattr(obj, 'estudiante_profile'):
                from students.models import Estudiante
                Estudiante.objects.create(
                    user=obj,
                    status='pending',
                    api_level=1,
                    strikes=0,
                    gpa=0.0,
                    completed_projects=0,
                    total_hours=0,
                    experience_years=0,
                    rating=0.0
                )
            elif obj.role == 'company' and not hasattr(obj, 'empresa_profile'):
                from companies.models import Empresa
                Empresa.objects.create(
                    user=obj,
                    company_name=obj.first_name or obj.email,
                    verified=False,
                    rating=0.0,
                    total_projects=0,
                    projects_completed=0,
                    total_hours_offered=0,
                    status='active'
                )
        
        return obj

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
        user = request.user
        
        # Crear perfil automáticamente si no existe
        if user.role == 'student' and not hasattr(user, 'estudiante_profile'):
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
        elif user.role == 'company' and not hasattr(user, 'empresa_profile'):
            from companies.models import Empresa
            Empresa.objects.create(
                user=user,
                company_name=user.first_name or user.email,
                verified=False,
                rating=0.0,
                total_projects=0,
                projects_completed=0,
                total_hours_offered=0,
                status='active'
            )
        
        serializer = UsuarioSerializer(user)
        return Response(serializer.data)

class AuthViewSet(viewsets.ViewSet):
    """ViewSet para autenticación"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

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
    serializer_class = ChangePasswordSerializer

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
    serializer_class = UsuarioSerializer

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

    @action(detail=False, methods=['get'])
    def student_stats(self, request):
        """Estadísticas específicas para estudiantes"""
        if not request.user.es_estudiante:
            return Response({'error': 'Acceso denegado'}, status=status.HTTP_403_FORBIDDEN)
        return self._student_stats(request.user)

    @action(detail=False, methods=['get'])
    def company_stats(self, request):
        """Estadísticas específicas para empresas"""
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"[company_stats] Llamada por usuario: {request.user} (id={request.user.id}, email={request.user.email}, es_empresa={getattr(request.user, 'es_empresa', None)})")
        if not request.user.es_empresa:
            logger.warning(f"[company_stats] Acceso denegado para usuario: {request.user} (id={request.user.id})")
            return Response({'error': 'Acceso denegado'}, status=status.HTTP_403_FORBIDDEN)
        try:
            resp = self._company_stats(request.user)
            logger.info(f"[company_stats] Respuesta: {resp.data}")
            return resp
        except Exception as e:
            logger.error(f"[company_stats] Error interno: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def admin_stats(self, request):
        """Estadísticas específicas para administradores"""
        if not request.user.es_admin:
            return Response({'error': 'Acceso denegado'}, status=status.HTTP_403_FORBIDDEN)
        return self._admin_stats()

    def _admin_stats(self):
        """Estadísticas para administradores"""
        from projects.models import Proyecto, AplicacionProyecto
        from students.models import Estudiante
        from companies.models import Empresa
        import logging
        
        logger = logging.getLogger(__name__)
        logger.info("[_admin_stats] Calculando estadísticas de administrador")
        
        try:
            # Optimizar consultas con select_related y prefetch_related
            total_users = Usuario.objects.count()
            active_users = Usuario.objects.filter(is_active=True).count()
            students = Usuario.objects.filter(role='student').count()
            companies = Usuario.objects.filter(role='company').count()
            
            # Optimizar consultas de proyectos
            total_projects = Proyecto.objects.select_related('status', 'empresa').count()
            active_projects = Proyecto.objects.select_related('status').filter(status__name='active').count()
            completed_projects = Proyecto.objects.select_related('status').filter(status__name='completed').count()
            
            # Optimizar consultas de aplicaciones
            total_applications = AplicacionProyecto.objects.select_related('proyecto', 'estudiante').count()
            pending_applications = AplicacionProyecto.objects.select_related('proyecto').filter(status='pending').count()
            
            # Calcular horas totales
            total_hours = Estudiante.objects.aggregate(total=Sum('total_hours'))['total'] or 0
            
            # Calcular rating promedio
            avg_rating = Estudiante.objects.aggregate(avg=Avg('rating'))['avg'] or 0.0
            
            stats = {
                'total_users': total_users,
                'active_users': active_users,
                'students': students,
                'companies': companies,
                'total_projects': total_projects,
                'active_projects': active_projects,
                'completed_projects': completed_projects,
                'total_applications': total_applications,
                'pending_applications': pending_applications,
                'total_hours': total_hours,
                'average_rating': float(avg_rating),
                'new_users_this_month': 0,  # TODO: Implementar cálculo por mes
                'projects_this_month': 0,   # TODO: Implementar cálculo por mes
            }
            
            logger.info(f"[_admin_stats] Estadísticas calculadas: {stats}")
            return Response(stats)
            
        except Exception as e:
            logger.error(f"[_admin_stats] Error calculando estadísticas: {str(e)}", exc_info=True)
            return Response({
                'total_users': 0,
                'active_users': 0,
                'students': 0,
                'companies': 0,
                'total_projects': 0,
                'active_projects': 0,
                'completed_projects': 0,
                'total_applications': 0,
                'pending_applications': 0,
                'total_hours': 0,
                'average_rating': 0.0,
                'new_users_this_month': 0,
                'projects_this_month': 0,
            })

    def _student_stats(self, user):
        """Estadísticas para estudiantes"""
        from projects.models import Proyecto, AplicacionProyecto, MiembroProyecto
        from students.models import Estudiante
        import logging
        
        logger = logging.getLogger(__name__)
        logger.info(f"[_student_stats] Procesando estadísticas para usuario: {user.email} (id={user.id})")
        
        try:
            # Asegurar que el estudiante tenga perfil
            if not hasattr(user, 'estudiante_profile'):
                logger.info(f"[_student_stats] Creando perfil de estudiante para: {user.email}")
                estudiante = Estudiante.objects.create(
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
            else:
                estudiante = user.estudiante_profile
            
            logger.info(f"[_student_stats] Perfil de estudiante encontrado: {estudiante.id}")
            
            # Optimizar consultas de proyectos del estudiante
            my_projects = MiembroProyecto.objects.filter(estudiante=estudiante).select_related(
                'proyecto', 'proyecto__status'
            )
            active_projects = my_projects.filter(proyecto__status__name='active').count()
            completed_projects = my_projects.filter(proyecto__status__name='completed').count()
            
            # Optimizar consultas de aplicaciones del estudiante
            my_applications = AplicacionProyecto.objects.filter(estudiante=estudiante).select_related(
                'proyecto', 'proyecto__status'
            )
            pending_applications = my_applications.filter(status='pending').count()
            accepted_applications = my_applications.filter(status='accepted').count()
            
            # Optimizar consulta de proyectos disponibles
            applied_project_ids = my_applications.values_list('proyecto_id', flat=True)
            available_projects = Proyecto.objects.select_related('status').filter(
                status__name='published'
            ).exclude(id__in=applied_project_ids).count()
            
            stats = {
                'strikes': estudiante.strikes,
                'gpa': float(estudiante.gpa),
                'completed_projects': completed_projects,
                'total_hours': estudiante.total_hours,
                'rating': float(estudiante.rating),
                'active_projects': active_projects,
                'pending_applications': pending_applications,
                'accepted_applications': accepted_applications,
                'available_projects': available_projects,
                'total_applications': my_applications.count(),
            }
            
            logger.info(f"[_student_stats] Estadísticas calculadas: {stats}")
            return Response(stats)
            
        except Exception as e:
            logger.error(f"[_student_stats] Error calculando estadísticas: {str(e)}", exc_info=True)
            return Response({
                'strikes': 0,
                'gpa': 0.0,
                'completed_projects': 0,
                'total_hours': 0,
                'rating': 0.0,
                'active_projects': 0,
                'pending_applications': 0,
                'accepted_applications': 0,
                'available_projects': 0,
                'total_applications': 0,
            })

    def _company_stats(self, user):
        """Estadísticas para empresas"""
        from projects.models import Proyecto, AplicacionProyecto, MiembroProyecto
        from companies.models import Empresa
        import logging
        
        logger = logging.getLogger(__name__)
        logger.info(f"[_company_stats] Procesando estadísticas para empresa: {user.email} (id={user.id})")
        
        try:
            # Asegurar que la empresa tenga perfil
            if not hasattr(user, 'empresa_profile'):
                logger.info(f"[_company_stats] Creando perfil de empresa para: {user.email}")
                empresa = Empresa.objects.create(
                    user=user,
                    company_name=user.first_name or user.email,
                    verified=False,
                    rating=0.0,
                    total_projects=0,
                    projects_completed=0,
                    total_hours_offered=0,
                    status='active'
                )
            else:
                empresa = user.empresa_profile
            
            logger.info(f"[_company_stats] Perfil de empresa encontrado: {empresa.id}")
            
            # Optimizar consultas de proyectos de la empresa
            company_projects = Proyecto.objects.filter(empresa=empresa).select_related('status')
            active_projects = company_projects.filter(status__name='active').count()
            completed_projects = company_projects.filter(status__name='completed').count()
            published_projects = company_projects.filter(status__name='published').count()
            
            # Optimizar consultas de aplicaciones a proyectos de la empresa
            company_applications = AplicacionProyecto.objects.filter(
                proyecto__empresa=empresa
            ).select_related('proyecto', 'estudiante')
            pending_applications = company_applications.filter(status='pending').count()
            accepted_applications = company_applications.filter(status='accepted').count()
            
            # Optimizar consulta de estudiantes activos
            active_students = MiembroProyecto.objects.filter(
                proyecto__empresa=empresa,
                proyecto__status__name='active'
            ).select_related('estudiante', 'proyecto').values('estudiante').distinct().count()
            
            stats = {
                'rating': float(empresa.rating),
                'total_projects': company_projects.count(),
                'projects_completed': completed_projects,
                'total_hours_offered': empresa.total_hours_offered,
                'active_projects': active_projects,
                'published_projects': published_projects,
                'pending_applications': pending_applications,
                'accepted_applications': accepted_applications,
                'active_students': active_students,
                'total_applications': company_applications.count(),
            }
            
            logger.info(f"[_company_stats] Estadísticas calculadas: {stats}")
            return Response(stats)
            
        except Exception as e:
            logger.error(f"[_company_stats] Error calculando estadísticas: {str(e)}", exc_info=True)
            return Response({
                'rating': 0.0,
                'total_projects': 0,
                'projects_completed': 0,
                'total_hours_offered': 0,
                'active_projects': 0,
                'published_projects': 0,
                'pending_applications': 0,
                'accepted_applications': 0,
                'active_students': 0,
                'total_applications': 0,
            })

class UserRegistrationView(APIView):
    """Vista para registro de usuarios"""
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': UsuarioSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TestAuthView(APIView):
    """Vista de prueba para verificar autenticación"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request):
        """Probar autenticación con email y password"""
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Email y password son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Usuario.objects.get(email=email)
            if user.check_password(password):
                return Response({
                    'success': True,
                    'user': {
                        'id': str(user.id),
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                        'is_active': user.is_active,
                        'is_verified': user.is_verified
                    }
                })
            else:
                return Response({
                    'error': 'Contraseña incorrecta'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Usuario.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND) 