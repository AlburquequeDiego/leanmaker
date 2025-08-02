from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Documents


@login_required
def documents_list(request):
    """Lista todos los documents"""
    documentss = Documents.objects.filter(is_active=True).order_by('-created_at')
    
    context = {
        'documentss': documentss,
        'total_documentss': documentss.count(),
    }
    
    return render(request, 'documents/documents_list.html', context)


@login_required
def documents_create(request):
    """Crear nuevo documents"""
    return JsonResponse({'message': 'Función no implementada'})


@login_required
def documents_detail(request, pk):
    """Detalle de un documents"""
    return JsonResponse({'message': 'Función no implementada'})
