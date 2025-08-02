from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import DisciplinaryRecords


@login_required
def disciplinary_records_list(request):
    """Lista todos los disciplinary records"""
    disciplinary_recordss = DisciplinaryRecords.objects.filter(is_active=True).order_by('-created_at')
    
    context = {
        'disciplinary_recordss': disciplinary_recordss,
        'total_disciplinary_recordss': disciplinary_recordss.count(),
    }
    
    return render(request, 'disciplinary_records/disciplinary_records_list.html', context)


@login_required
def disciplinary_records_create(request):
    """Crear nuevo disciplinary records"""
    return JsonResponse({'message': 'Función no implementada'})


@login_required
def disciplinary_records_detail(request, pk):
    """Detalle de un disciplinary records"""
    return JsonResponse({'message': 'Función no implementada'})
