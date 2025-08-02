from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Reports


@login_required
def reports_list(request):
    """Lista todos los reports"""
    reportss = Reports.objects.filter(is_active=True).order_by('-created_at')
    
    context = {
        'reportss': reportss,
        'total_reportss': reportss.count(),
    }
    
    return render(request, 'reports/reports_list.html', context)


@login_required
def reports_create(request):
    """Crear nuevo reports"""
    return JsonResponse({'message': 'Función no implementada'})


@login_required
def reports_detail(request, pk):
    """Detalle de un reports"""
    return JsonResponse({'message': 'Función no implementada'})
