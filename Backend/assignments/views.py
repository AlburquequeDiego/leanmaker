from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
import json
from datetime import datetime, date
from .models import Assignment, AssignmentRole, AssignmentMilestone
from students.models import Estudiante
from projects.models import Proyecto


@login_required
def assignment_list(request):
    """Lista todas las asignaciones"""
    assignments = Assignment.objects.all().order_by('-assigned_date')
    
    # Filtros
    status_filter = request.GET.get('status')
    student_filter = request.GET.get('student')
    project_filter = request.GET.get('project')
    
    if status_filter:
        assignments = assignments.filter(status=status_filter)
    if student_filter:
        assignments = assignments.filter(student__user__first_name__icontains=student_filter)
    if project_filter:
        assignments = assignments.filter(project__title__icontains=project_filter)
    
    # Paginación
    paginator = Paginator(assignments, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'total_assignments': assignments.count(),
        'students': Estudiante.objects.all(),
        'projects': Proyecto.objects.all(),
    }
    
    return render(request, 'assignments/assignment_list.html', context)


@login_required
def assignment_create(request):
    """Crear nueva asignación"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            student = get_object_or_404(Estudiante, id=data['student_id'])
            project = get_object_or_404(Proyecto, id=data['project_id'])
            
            assignment = Assignment.objects.create(
                student=student,
                project=project,
                assigned_by=request.user,
                status=data.get('status', 'pending'),
                start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data.get('start_date') else None,
                end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None,
                notes=data.get('notes', '')
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Asignación creada exitosamente',
                'assignment_id': assignment.id
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al crear asignación: {str(e)}'
            }, status=400)
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def assignment_detail(request, pk):
    """Detalle de una asignación"""
    assignment = get_object_or_404(Assignment, pk=pk)
    milestones = assignment.milestones.all().order_by('due_date')
    roles = assignment.roles.all()
    
    context = {
        'assignment': assignment,
        'milestones': milestones,
        'roles': roles,
    }
    
    return render(request, 'assignments/assignment_detail.html', context)


@login_required
def assignment_edit(request, pk):
    """Editar asignación"""
    assignment = get_object_or_404(Assignment, pk=pk)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            assignment.status = data.get('status', assignment.status)
            assignment.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data.get('start_date') else None
            assignment.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None
            assignment.notes = data.get('notes', '')
            assignment.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Asignación actualizada exitosamente'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al actualizar asignación: {str(e)}'
            }, status=400)
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def assignment_delete(request, pk):
    """Eliminar asignación"""
    assignment = get_object_or_404(Assignment, pk=pk)
    
    if request.method == 'POST':
        assignment.delete()
        return JsonResponse({
            'success': True,
            'message': 'Asignación eliminada exitosamente'
        })
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def milestone_list(request, pk):
    """Lista de hitos de una asignación"""
    assignment = get_object_or_404(Assignment, pk=pk)
    milestones = assignment.milestones.all().order_by('due_date')
    
    context = {
        'assignment': assignment,
        'milestones': milestones,
    }
    
    return render(request, 'assignments/milestone_list.html', context)


@login_required
def milestone_create(request, pk):
    """Crear nuevo hito"""
    assignment = get_object_or_404(Assignment, pk=pk)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            milestone = AssignmentMilestone.objects.create(
                assignment=assignment,
                title=data['title'],
                description=data.get('description', ''),
                due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date(),
                status=data.get('status', 'pending')
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Hito creado exitosamente',
                'milestone_id': milestone.id
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al crear hito: {str(e)}'
            }, status=400)
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def student_assignments(request, student_id):
    """Asignaciones de un estudiante específico"""
    student = get_object_or_404(Estudiante, id=student_id)
    assignments = Assignment.objects.filter(student=student).order_by('-assigned_date')
    
    context = {
        'student': student,
        'assignments': assignments,
    }
    
    return render(request, 'assignments/student_assignments.html', context)


@login_required
def project_assignments(request, project_id):
    """Asignaciones de un proyecto específico"""
    project = get_object_or_404(Proyecto, id=project_id)
    assignments = Assignment.objects.filter(project=project).order_by('-assigned_date')
    
    context = {
        'project': project,
        'assignments': assignments,
    }
    
    return render(request, 'assignments/project_assignments.html', context) 