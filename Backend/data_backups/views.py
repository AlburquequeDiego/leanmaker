from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import DataBackups


@login_required
def data_backups_list(request):
    """Lista todos los data backups"""
    data_backupss = DataBackups.objects.filter(is_active=True).order_by('-created_at')
    
    context = {
        'data_backupss': data_backupss,
        'total_data_backupss': data_backupss.count(),
    }
    
    return render(request, 'data_backups/data_backups_list.html', context)


@login_required
def data_backups_create(request):
    """Crear nuevo data backups"""
    return JsonResponse({'message': 'Función no implementada'})


@login_required
def data_backups_detail(request, pk):
    """Detalle de un data backups"""
    return JsonResponse({'message': 'Función no implementada'})
