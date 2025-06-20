from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Q
from datetime import datetime, timedelta
from .models import WorkHours
from .serializers import WorkHoursSerializer, WorkHoursCreateSerializer, WorkHoursApprovalSerializer
from users.models import CustomUser

class WorkHoursViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Horas de Trabajo.
    - Los estudiantes pueden crear y ver sus propias horas de trabajo.
    - Las empresas pueden ver y aprobar horas de trabajo de sus proyectos.
    - Los admins pueden ver y gestionar todas las horas de trabajo.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return WorkHoursCreateSerializer
        elif self.action in ['approve', 'reject']:
            return WorkHoursApprovalSerializer
        return WorkHoursSerializer

    def get_queryset(self):
        """
        Filtra las horas de trabajo según el rol del usuario.
        """
        user = self.request.user
        
        if user.is_staff:
            return WorkHours.objects.all()
        
        if user.role == CustomUser.Role.STUDENT:
            # Estudiantes ven solo sus propias horas
            return WorkHours.objects.filter(student=user)
        
        if user.role == CustomUser.Role.COMPANY:
            # Empresas ven horas de trabajo de sus proyectos
            return WorkHours.objects.filter(project__company=user.company_profile)
        
        return WorkHours.objects.none()

    def perform_create(self, serializer):
        """
        Asigna automáticamente el estudiante actual.
        """
        if self.request.user.role != CustomUser.Role.STUDENT:
            raise permissions.PermissionDenied("Solo los estudiantes pueden registrar horas de trabajo.")
        
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Aprobar horas de trabajo (solo empresas).
        """
        if request.user.role != CustomUser.Role.COMPANY:
            return Response(
                {'error': 'Solo las empresas pueden aprobar horas de trabajo'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        work_hours = self.get_object()
        
        # Verificar que la empresa sea dueña del proyecto
        if work_hours.project.company.user != request.user:
            return Response(
                {'error': 'No puede aprobar horas de trabajo de otros proyectos'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        work_hours.is_approved = True
        work_hours.approved_by = request.user
        work_hours.approved_at = timezone.now()
        work_hours.save()
        
        serializer = self.get_serializer(work_hours)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Rechazar horas de trabajo (solo empresas).
        """
        if request.user.role != CustomUser.Role.COMPANY:
            return Response(
                {'error': 'Solo las empresas pueden rechazar horas de trabajo'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        work_hours = self.get_object()
        
        # Verificar que la empresa sea dueña del proyecto
        if work_hours.project.company.user != request.user:
            return Response(
                {'error': 'No puede rechazar horas de trabajo de otros proyectos'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        work_hours.is_approved = False
        work_hours.approved_by = request.user
        work_hours.approved_at = timezone.now()
        work_hours.save()
        
        serializer = self.get_serializer(work_hours)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_summary(self, request):
        """
        Resumen de horas trabajadas del usuario actual.
        """
        user = request.user
        
        if user.role == CustomUser.Role.STUDENT:
            queryset = WorkHours.objects.filter(student=user)
        elif user.role == CustomUser.Role.COMPANY:
            queryset = WorkHours.objects.filter(project__company=user.company_profile)
        else:
            queryset = WorkHours.objects.all()
        
        # Estadísticas generales
        total_hours = queryset.aggregate(total=Sum('hours_worked'))['total'] or 0
        approved_hours = queryset.filter(is_approved=True).aggregate(total=Sum('hours_worked'))['total'] or 0
        pending_hours = queryset.filter(is_approved=False).aggregate(total=Sum('hours_worked'))['total'] or 0
        
        # Horas por proyecto
        project_summary = queryset.values('project__title').annotate(
            total_hours=Sum('hours_worked'),
            approved_hours=Sum('hours_worked', filter=Q(is_approved=True)),
            pending_hours=Sum('hours_worked', filter=Q(is_approved=False))
        )
        
        return Response({
            'total_hours': round(total_hours, 2),
            'approved_hours': round(approved_hours, 2),
            'pending_hours': round(pending_hours, 2),
            'project_summary': project_summary
        })
