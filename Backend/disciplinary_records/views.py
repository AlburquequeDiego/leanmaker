from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Max
from django.utils import timezone
from datetime import timedelta

from .models import DisciplinaryRecord
from .serializers import (
    DisciplinaryRecordSerializer, DisciplinaryRecordListSerializer,
    DisciplinaryRecordStatsSerializer, DisciplinaryRecordByStudentSerializer,
    DisciplinaryRecordByCompanySerializer
)


class DisciplinaryRecordViewSet(viewsets.ModelViewSet):
    """ViewSet para registros disciplinarios"""
    queryset = DisciplinaryRecord.objects.all()
    serializer_class = DisciplinaryRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['severity', 'student', 'company', 'recorded_by']
    search_fields = ['description', 'action_taken', 'student__user__full_name', 'company__name']
    ordering_fields = ['incident_date', 'recorded_at', 'severity']
    ordering = ['-incident_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return DisciplinaryRecordListSerializer
        return DisciplinaryRecordSerializer

    def get_queryset(self):
        """Optimizar consultas"""
        return super().get_queryset().select_related(
            'student__user', 'company', 'recorded_by'
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de registros disciplinarios"""
        queryset = self.get_queryset()
        
        # Fechas para filtros
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Estadísticas básicas
        total_records = queryset.count()
        records_this_month = queryset.filter(incident_date__gte=this_month_start).count()
        records_this_year = queryset.filter(incident_date__gte=this_year_start).count()
        
        # Por severidad
        critical_records = queryset.filter(severity='critical').count()
        high_records = queryset.filter(severity='high').count()
        medium_records = queryset.filter(severity='medium').count()
        low_records = queryset.filter(severity='low').count()
        
        # Por entidades
        students_with_records = queryset.values('student').distinct().count()
        companies_with_records = queryset.values('company').distinct().count()
        
        # Promedios
        if students_with_records > 0:
            average_records_per_student = total_records / students_with_records
        else:
            average_records_per_student = 0
            
        if companies_with_records > 0:
            average_records_per_company = total_records / companies_with_records
        else:
            average_records_per_company = 0
        
        stats = {
            'total_records': total_records,
            'records_this_month': records_this_month,
            'records_this_year': records_this_year,
            'critical_records': critical_records,
            'high_records': high_records,
            'medium_records': medium_records,
            'low_records': low_records,
            'students_with_records': students_with_records,
            'companies_with_records': companies_with_records,
            'average_records_per_student': round(average_records_per_student, 2),
            'average_records_per_company': round(average_records_per_company, 2),
        }
        
        serializer = DisciplinaryRecordStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Obtener registros agrupados por estudiante"""
        queryset = self.get_queryset()
        
        # Agrupar por estudiante
        students_data = queryset.values('student').annotate(
            total_records=Count('id'),
            critical_records=Count('id', filter=Q(severity='critical')),
            high_records=Count('id', filter=Q(severity='high')),
            medium_records=Count('id', filter=Q(severity='medium')),
            low_records=Count('id', filter=Q(severity='low')),
            last_incident_date=Max('incident_date')
        ).order_by('-total_records')
        
        # Enriquecer con información del estudiante
        result = []
        for data in students_data:
            student = data['student']
            from students.models import Estudiante
            try:
                student_obj = Estudiante.objects.select_related('user').get(id=student)
                result.append({
                    'student_id': student,
                    'student_name': student_obj.user.full_name,
                    'total_records': data['total_records'],
                    'critical_records': data['critical_records'],
                    'high_records': data['high_records'],
                    'medium_records': data['medium_records'],
                    'low_records': data['low_records'],
                    'last_incident_date': data['last_incident_date'],
                })
            except Estudiante.DoesNotExist:
                continue
        
        serializer = DisciplinaryRecordByStudentSerializer(result, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_company(self, request):
        """Obtener registros agrupados por empresa"""
        queryset = self.get_queryset()
        
        # Agrupar por empresa
        companies_data = queryset.values('company').annotate(
            total_records=Count('id'),
            critical_records=Count('id', filter=Q(severity='critical')),
            high_records=Count('id', filter=Q(severity='high')),
            medium_records=Count('id', filter=Q(severity='medium')),
            low_records=Count('id', filter=Q(severity='low')),
            students_involved=Count('student', distinct=True),
            last_incident_date=Max('incident_date')
        ).order_by('-total_records')
        
        # Enriquecer con información de la empresa
        result = []
        for data in companies_data:
            company = data['company']
            from companies.models import Empresa
            try:
                company_obj = Empresa.objects.get(id=company)
                result.append({
                    'company_id': company,
                    'company_name': company_obj.name,
                    'total_records': data['total_records'],
                    'critical_records': data['critical_records'],
                    'high_records': data['high_records'],
                    'medium_records': data['medium_records'],
                    'low_records': data['low_records'],
                    'students_involved': data['students_involved'],
                    'last_incident_date': data['last_incident_date'],
                })
            except Empresa.DoesNotExist:
                continue
        
        serializer = DisciplinaryRecordByCompanySerializer(result, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Obtener registros recientes (últimos 30 días)"""
        queryset = self.get_queryset()
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        
        recent_records = queryset.filter(incident_date__gte=thirty_days_ago)
        
        page = self.paginate_queryset(recent_records)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(recent_records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def critical(self, request):
        """Obtener registros críticos"""
        queryset = self.get_queryset()
        critical_records = queryset.filter(severity='critical')
        
        page = self.paginate_queryset(critical_records)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(critical_records, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_action(self, request, pk=None):
        """Agregar acción disciplinaria a un registro"""
        record = self.get_object()
        action_taken = request.data.get('action_taken')
        
        if not action_taken:
            return Response(
                {'error': 'Debe proporcionar una acción disciplinaria'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        record.action_taken = action_taken
        record.save()
        
        serializer = self.get_serializer(record)
        return Response(serializer.data)
