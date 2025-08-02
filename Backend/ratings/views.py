from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Avg, Count
import json
from .models import Rating, StudentCompanyRating, CompanyStudentRating, ProjectRating
from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto


@login_required
def rating_list(request):
    """Lista todas las calificaciones"""
    ratings = Rating.objects.all().order_by('-created_at')
    
    # Filtros
    rating_type_filter = request.GET.get('rating_type')
    min_rating = request.GET.get('min_rating')
    max_rating = request.GET.get('max_rating')
    
    if rating_type_filter:
        ratings = ratings.filter(rating_type=rating_type_filter)
    if min_rating:
        ratings = ratings.filter(rating_value__gte=min_rating)
    if max_rating:
        ratings = ratings.filter(rating_value__lte=max_rating)
    
    # Paginación
    paginator = Paginator(ratings, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Estadísticas
    avg_rating = ratings.aggregate(Avg('rating_value'))['rating_value__avg'] or 0
    total_ratings = ratings.count()
    
    context = {
        'page_obj': page_obj,
        'total_ratings': total_ratings,
        'avg_rating': round(avg_rating, 2),
    }
    
    return render(request, 'ratings/rating_list.html', context)


@login_required
def rating_create(request):
    """Crear nueva calificación"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            rating = Rating.objects.create(
                rating_type=data['rating_type'],
                rating_value=data['rating_value'],
                comment=data.get('comment', '')
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Calificación creada exitosamente',
                'rating_id': rating.id
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al crear calificación: {str(e)}'
            }, status=400)
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def rating_detail(request, pk):
    """Detalle de una calificación"""
    rating = get_object_or_404(Rating, pk=pk)
    
    context = {
        'rating': rating,
    }
    
    return render(request, 'ratings/rating_detail.html', context)


@login_required
def rating_edit(request, pk):
    """Editar calificación"""
    rating = get_object_or_404(Rating, pk=pk)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            rating.rating_value = data['rating_value']
            rating.comment = data.get('comment', '')
            rating.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Calificación actualizada exitosamente'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al actualizar calificación: {str(e)}'
            }, status=400)
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def rating_delete(request, pk):
    """Eliminar calificación"""
    rating = get_object_or_404(Rating, pk=pk)
    
    if request.method == 'POST':
        rating.delete()
        return JsonResponse({
            'success': True,
            'message': 'Calificación eliminada exitosamente'
        })
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def student_company_ratings(request):
    """Calificaciones de estudiantes a empresas"""
    ratings = StudentCompanyRating.objects.all().order_by('-rating__created_at')
    
    # Filtros
    student_filter = request.GET.get('student')
    company_filter = request.GET.get('company')
    
    if student_filter:
        ratings = ratings.filter(student__user__first_name__icontains=student_filter)
    if company_filter:
        ratings = ratings.filter(company__company_name__icontains=company_filter)
    
    # Paginación
    paginator = Paginator(ratings, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Estadísticas
    avg_rating = ratings.aggregate(Avg('rating__rating_value'))['rating__rating_value__avg'] or 0
    
    context = {
        'page_obj': page_obj,
        'total_ratings': ratings.count(),
        'avg_rating': round(avg_rating, 2),
    }
    
    return render(request, 'ratings/student_company_ratings.html', context)


@login_required
def company_student_ratings(request):
    """Calificaciones de empresas a estudiantes"""
    ratings = CompanyStudentRating.objects.all().order_by('-rating__created_at')
    
    # Filtros
    company_filter = request.GET.get('company')
    student_filter = request.GET.get('student')
    
    if company_filter:
        ratings = ratings.filter(company__company_name__icontains=company_filter)
    if student_filter:
        ratings = ratings.filter(student__user__first_name__icontains=student_filter)
    
    # Paginación
    paginator = Paginator(ratings, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Estadísticas
    avg_rating = ratings.aggregate(Avg('rating__rating_value'))['rating__rating_value__avg'] or 0
    
    context = {
        'page_obj': page_obj,
        'total_ratings': ratings.count(),
        'avg_rating': round(avg_rating, 2),
    }
    
    return render(request, 'ratings/company_student_ratings.html', context)


@login_required
def project_ratings(request):
    """Calificaciones de proyectos"""
    ratings = ProjectRating.objects.all().order_by('-rating__created_at')
    
    # Filtros
    project_filter = request.GET.get('project')
    category_filter = request.GET.get('category')
    
    if project_filter:
        ratings = ratings.filter(project__title__icontains=project_filter)
    if category_filter:
        ratings = ratings.filter(category=category_filter)
    
    # Paginación
    paginator = Paginator(ratings, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Estadísticas
    avg_rating = ratings.aggregate(Avg('rating__rating_value'))['rating__rating_value__avg'] or 0
    
    context = {
        'page_obj': page_obj,
        'total_ratings': ratings.count(),
        'avg_rating': round(avg_rating, 2),
    }
    
    return render(request, 'ratings/project_ratings.html', context) 