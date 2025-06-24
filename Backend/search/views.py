from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models.functions import Greatest

from .models import SearchHistory, SearchSuggestion
from .serializers import (
    SearchHistorySerializer, SearchSuggestionSerializer, SearchResultSerializer,
    SearchStatsSerializer
)
from users.models import User
from projects.models import Project
from evaluations.models import Evaluation

class SearchViewSet(viewsets.ViewSet):
    """ViewSet para funcionalidades de búsqueda"""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def global_search(self, request):
        """Búsqueda global en toda la plataforma"""
        query = request.query_params.get('q', '')
        search_type = request.query_params.get('type', 'all')
        limit = int(request.query_params.get('limit', 20))
        
        if not query:
            return Response(
                {"error": "Se requiere el parámetro 'q' para la búsqueda"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = {
            'query': query,
            'total_results': 0,
            'results': {}
        }
        
        # Búsqueda en usuarios
        if search_type in ['all', 'users']:
            user_results = User.objects.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email__icontains=query) |
                Q(company_name__icontains=query) |
                Q(career__icontains=query)
            ).filter(is_active=True)
            
            if request.user.role == 'company':
                user_results = user_results.filter(role='student')
            elif request.user.role == 'student':
                user_results = user_results.filter(role='company')
            
            results['results']['users'] = {
                'count': user_results.count(),
                'data': user_results[:limit]
            }
            results['total_results'] += user_results.count()
        
        # Búsqueda en proyectos
        if search_type in ['all', 'projects']:
            project_results = Project.objects.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(required_skills__icontains=query) |
                Q(preferred_skills__icontains=query) |
                Q(area__icontains=query)
            ).filter(status='published')
            
            if request.user.role == 'company':
                project_results = project_results.filter(company=request.user)
            elif request.user.role == 'student':
                # Los estudiantes ven todos los proyectos publicados
                pass
            
            results['results']['projects'] = {
                'count': project_results.count(),
                'data': project_results[:limit]
            }
            results['total_results'] += project_results.count()
        
        # Búsqueda en evaluaciones (solo para admins)
        if search_type in ['all', 'evaluations'] and request.user.role == 'admin':
            evaluation_results = Evaluation.objects.filter(
                Q(comments__icontains=query) |
                Q(feedback__icontains=query)
            )
            
            results['results']['evaluations'] = {
                'count': evaluation_results.count(),
                'data': evaluation_results[:limit]
            }
            results['total_results'] += evaluation_results.count()
        
        # Guardar historial de búsqueda
        if request.user.is_authenticated:
            SearchHistory.objects.create(
                user=request.user,
                query=query,
                search_type=search_type,
                results_count=results['total_results']
            )
        
        return Response(results)

    @action(detail=False, methods=['get'])
    def advanced_search(self, request):
        """Búsqueda avanzada con filtros"""
        query = request.query_params.get('q', '')
        search_type = request.query_params.get('type', 'all')
        filters = request.query_params
        
        if not query:
            return Response(
                {"error": "Se requiere el parámetro 'q' para la búsqueda"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = {
            'query': query,
            'filters': dict(filters),
            'total_results': 0,
            'results': {}
        }
        
        # Búsqueda avanzada en usuarios
        if search_type in ['all', 'users']:
            user_query = User.objects.filter(is_active=True)
            
            # Filtros específicos para usuarios
            if filters.get('role'):
                user_query = user_query.filter(role=filters['role'])
            if filters.get('career'):
                user_query = user_query.filter(career__icontains=filters['career'])
            if filters.get('semester'):
                user_query = user_query.filter(semester=filters['semester'])
            if filters.get('company_industry'):
                user_query = user_query.filter(company_industry__icontains=filters['company_industry'])
            
            # Búsqueda de texto
            user_query = user_query.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email__icontains=query) |
                Q(company_name__icontains=query) |
                Q(career__icontains=query)
            )
            
            if request.user.role == 'company':
                user_query = user_query.filter(role='student')
            elif request.user.role == 'student':
                user_query = user_query.filter(role='company')
            
            results['results']['users'] = {
                'count': user_query.count(),
                'data': user_query
            }
            results['total_results'] += user_query.count()
        
        # Búsqueda avanzada en proyectos
        if search_type in ['all', 'projects']:
            project_query = Project.objects.filter(status='published')
            
            # Filtros específicos para proyectos
            if filters.get('area'):
                project_query = project_query.filter(area__icontains=filters['area'])
            if filters.get('modality'):
                project_query = project_query.filter(modality=filters['modality'])
            if filters.get('difficulty'):
                project_query = project_query.filter(difficulty=filters['difficulty'])
            if filters.get('is_paid'):
                project_query = project_query.filter(is_paid=filters['is_paid'] == 'true')
            
            # Búsqueda de texto
            project_query = project_query.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(required_skills__icontains=query) |
                Q(preferred_skills__icontains=query) |
                Q(area__icontains=query)
            )
            
            if request.user.role == 'company':
                project_query = project_query.filter(company=request.user)
            
            results['results']['projects'] = {
                'count': project_query.count(),
                'data': project_query
            }
            results['total_results'] += project_query.count()
        
        # Guardar historial de búsqueda
        if request.user.is_authenticated:
            SearchHistory.objects.create(
                user=request.user,
                query=query,
                search_type=search_type,
                results_count=results['total_results'],
                filters_used=dict(filters)
            )
        
        return Response(results)

    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """Obtener sugerencias de búsqueda"""
        query = request.query_params.get('q', '')
        limit = int(request.query_params.get('limit', 10))
        
        if not query:
            return Response([])
        
        # Buscar en historial de búsquedas del usuario
        user_suggestions = SearchHistory.objects.filter(
            user=request.user,
            query__icontains=query
        ).values('query').distinct().order_by('-created_at')[:limit]
        
        # Buscar en sugerencias globales
        global_suggestions = SearchSuggestion.objects.filter(
            query__icontains=query,
            is_active=True
        ).order_by('-usage_count')[:limit]
        
        suggestions = []
        
        # Agregar sugerencias del usuario
        for suggestion in user_suggestions:
            suggestions.append({
                'query': suggestion['query'],
                'type': 'user_history'
            })
        
        # Agregar sugerencias globales
        for suggestion in global_suggestions:
            suggestions.append({
                'query': suggestion.query,
                'type': 'global',
                'usage_count': suggestion.usage_count
            })
        
        return Response(suggestions[:limit])

    @action(detail=False, methods=['get'])
    def popular_searches(self, request):
        """Obtener búsquedas populares"""
        limit = int(request.query_params.get('limit', 10))
        
        # Búsquedas populares globales
        popular_global = SearchSuggestion.objects.filter(
            is_active=True
        ).order_by('-usage_count')[:limit]
        
        # Búsquedas recientes del usuario
        recent_user = SearchHistory.objects.filter(
            user=request.user
        ).values('query').annotate(
            count=Count('id')
        ).order_by('-count')[:limit]
        
        results = {
            'global_popular': [
                {
                    'query': suggestion.query,
                    'usage_count': suggestion.usage_count
                } for suggestion in popular_global
            ],
            'user_recent': [
                {
                    'query': item['query'],
                    'count': item['count']
                } for item in recent_user
            ]
        }
        
        return Response(results)

class SearchHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión del historial de búsquedas"""
    queryset = SearchHistory.objects.all()
    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'search_type']
    search_fields = ['query']
    ordering_fields = ['created_at', 'results_count']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return SearchHistory.objects.all()
        else:
            # Los usuarios ven solo su historial
            return SearchHistory.objects.filter(user=user)

    def perform_create(self, serializer):
        """Asignar el usuario al crear el historial"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_history(self, request):
        """Historial de búsquedas del usuario actual"""
        queryset = SearchHistory.objects.filter(user=request.user)
        serializer = SearchHistorySerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def clear_history(self, request):
        """Limpiar historial de búsquedas del usuario"""
        SearchHistory.objects.filter(user=request.user).delete()
        return Response({"message": "Historial de búsquedas limpiado correctamente"})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de búsquedas"""
        if request.user.role == 'admin':
            # Estadísticas generales
            stats = {
                'total_searches': SearchHistory.objects.count(),
                'unique_users': SearchHistory.objects.values('user').distinct().count(),
                'searches_today': SearchHistory.objects.filter(
                    created_at__date=timezone.now().date()
                ).count(),
                'searches_by_type': SearchHistory.objects.values('search_type').annotate(count=Count('id')),
                'popular_queries': SearchHistory.objects.values('query').annotate(
                    count=Count('id')
                ).order_by('-count')[:10],
            }
        else:
            # Estadísticas del usuario
            user_searches = SearchHistory.objects.filter(user=request.user)
            stats = {
                'total_searches': user_searches.count(),
                'searches_today': user_searches.filter(
                    created_at__date=timezone.now().date()
                ).count(),
                'searches_this_week': user_searches.filter(
                    created_at__date__gte=timezone.now().date() - timezone.timedelta(days=7)
                ).count(),
                'popular_queries': user_searches.values('query').annotate(
                    count=Count('id')
                ).order_by('-count')[:5],
            }
        
        return Response(stats)

class SearchSuggestionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de sugerencias de búsqueda"""
    queryset = SearchSuggestion.objects.all()
    serializer_class = SearchSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_system']
    search_fields = ['query', 'description']
    ordering_fields = ['created_at', 'usage_count']
    ordering = ['-usage_count']

    def get_queryset(self):
        """Filtrar queryset según el rol del usuario"""
        user = self.request.user
        
        if user.role == 'admin':
            return SearchSuggestion.objects.all()
        else:
            # Otros usuarios ven solo sugerencias activas
            return SearchSuggestion.objects.filter(is_active=True)

    @action(detail=True, methods=['post'])
    def increment_usage(self, request, pk=None):
        """Incrementar contador de uso de una sugerencia"""
        suggestion = self.get_object()
        suggestion.usage_count += 1
        suggestion.save()
        return Response({"message": "Contador de uso incrementado"})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar sugerencia (solo para admins)"""
        if request.user.role != 'admin':
            return Response(
                {"error": "Solo los administradores pueden activar sugerencias"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        suggestion = self.get_object()
        suggestion.is_active = True
        suggestion.save()
        
        return Response({"message": "Sugerencia activada correctamente"})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desactivar sugerencia (solo para admins)"""
        if request.user.role != 'admin':
            return Response(
                {"error": "Solo los administradores pueden desactivar sugerencias"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        suggestion = self.get_object()
        suggestion.is_active = False
        suggestion.save()
        
        return Response({"message": "Sugerencia desactivada correctamente"}) 
