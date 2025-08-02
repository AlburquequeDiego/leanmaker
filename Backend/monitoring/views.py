from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Monitoring


@login_required
def monitoring_list(request):
    """Lista todos los monitoring"""
    monitorings = Monitoring.objects.filter(is_active=True).order_by('-created_at')
    
    context = {
        'monitorings': monitorings,
        'total_monitorings': monitorings.count(),
    }
    
    return render(request, 'monitoring/monitoring_list.html', context)


@login_required
def monitoring_create(request):
    """Crear nuevo monitoring"""
    return JsonResponse({'message': 'Función no implementada'})


@login_required
def monitoring_detail(request, pk):
    """Detalle de un monitoring"""
    return JsonResponse({'message': 'Función no implementada'})
