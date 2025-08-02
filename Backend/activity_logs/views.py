from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import ActivityLogs


@login_required
def activity_logs_list(request):
    """Lista todos los activity logs"""
    activity_logss = ActivityLogs.objects.filter(is_active=True).order_by('-created_at')
    
    context = {
        'activity_logss': activity_logss,
        'total_activity_logss': activity_logss.count(),
    }
    
    return render(request, 'activity_logs/activity_logs_list.html', context)


@login_required
def activity_logs_create(request):
    """Crear nuevo activity logs"""
    return JsonResponse({'message': 'Función no implementada'})


@login_required
def activity_logs_detail(request, pk):
    """Detalle de un activity logs"""
    return JsonResponse({'message': 'Función no implementada'})
