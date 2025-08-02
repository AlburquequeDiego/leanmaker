from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
import json
from .models import Questionnaire, Question, QuestionOption, QuestionnaireResponse, QuestionResponse
from students.models import Estudiante
from projects.models import Proyecto


@login_required
def questionnaire_list(request):
    """Lista todos los cuestionarios"""
    questionnaires = Questionnaire.objects.filter(is_active=True).order_by('-created_at')
    
    # Paginación
    paginator = Paginator(questionnaires, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'total_questionnaires': questionnaires.count(),
    }
    
    return render(request, 'questionnaires/questionnaire_list.html', context)


@login_required
def questionnaire_create(request):
    """Crear nuevo cuestionario"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            questionnaire = Questionnaire.objects.create(
                title=data['title'],
                description=data.get('description', ''),
                is_active=data.get('is_active', True)
            )
            
            # Crear preguntas
            for question_data in data.get('questions', []):
                question = Question.objects.create(
                    questionnaire=questionnaire,
                    text=question_data['text'],
                    question_type=question_data['question_type'],
                    required=question_data.get('required', True),
                    order=question_data.get('order', 0)
                )
                
                # Crear opciones si es necesario
                for option_data in question_data.get('options', []):
                    QuestionOption.objects.create(
                        question=question,
                        text=option_data['text'],
                        order=option_data.get('order', 0)
                    )
            
            return JsonResponse({
                'success': True,
                'message': 'Cuestionario creado exitosamente',
                'questionnaire_id': questionnaire.id
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al crear cuestionario: {str(e)}'
            }, status=400)
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def questionnaire_detail(request, pk):
    """Detalle de un cuestionario"""
    questionnaire = get_object_or_404(Questionnaire, pk=pk)
    questions = questionnaire.questions.all().order_by('order')
    
    context = {
        'questionnaire': questionnaire,
        'questions': questions,
    }
    
    return render(request, 'questionnaires/questionnaire_detail.html', context)


@login_required
def questionnaire_edit(request, pk):
    """Editar cuestionario"""
    questionnaire = get_object_or_404(Questionnaire, pk=pk)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            questionnaire.title = data['title']
            questionnaire.description = data.get('description', '')
            questionnaire.is_active = data.get('is_active', True)
            questionnaire.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Cuestionario actualizado exitosamente'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al actualizar cuestionario: {str(e)}'
            }, status=400)
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def questionnaire_delete(request, pk):
    """Eliminar cuestionario"""
    questionnaire = get_object_or_404(Questionnaire, pk=pk)
    
    if request.method == 'POST':
        questionnaire.delete()
        return JsonResponse({
            'success': True,
            'message': 'Cuestionario eliminado exitosamente'
        })
    
    return JsonResponse({'message': 'Método no permitido'}, status=405)


@login_required
def questionnaire_take(request, pk):
    """Tomar un cuestionario"""
    questionnaire = get_object_or_404(Questionnaire, pk=pk, is_active=True)
    questions = questionnaire.questions.all().order_by('order')
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            student = get_object_or_404(Estudiante, user=request.user)
            project = get_object_or_404(Proyecto, id=data['project_id'])
            
            # Crear respuesta de cuestionario
            response = QuestionnaireResponse.objects.create(
                questionnaire=questionnaire,
                student=student,
                project=project
            )
            
            # Crear respuestas individuales
            for question_response_data in data.get('responses', []):
                question = get_object_or_404(Question, id=question_response_data['question_id'])
                
                question_response = QuestionResponse.objects.create(
                    questionnaire_response=response,
                    question=question,
                    text_response=question_response_data.get('text_response'),
                    number_response=question_response_data.get('number_response'),
                    boolean_response=question_response_data.get('boolean_response')
                )
                
                # Agregar opciones seleccionadas si es necesario
                for option_id in question_response_data.get('selected_options', []):
                    option = get_object_or_404(QuestionOption, id=option_id)
                    question_response.selected_options.add(option)
            
            return JsonResponse({
                'success': True,
                'message': 'Cuestionario completado exitosamente',
                'response_id': response.id
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al completar cuestionario: {str(e)}'
            }, status=400)
    
    context = {
        'questionnaire': questionnaire,
        'questions': questions,
    }
    
    return render(request, 'questionnaires/questionnaire_take.html', context)


@login_required
def questionnaire_responses(request, pk):
    """Ver respuestas de un cuestionario"""
    questionnaire = get_object_or_404(Questionnaire, pk=pk)
    responses = questionnaire.responses.all().order_by('-submitted_at')
    
    # Paginación
    paginator = Paginator(responses, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'questionnaire': questionnaire,
        'page_obj': page_obj,
        'total_responses': responses.count(),
    }
    
    return render(request, 'questionnaires/questionnaire_responses.html', context)


@login_required
def response_detail(request, response_id):
    """Detalle de una respuesta"""
    response = get_object_or_404(QuestionnaireResponse, id=response_id)
    question_responses = response.question_responses.all()
    
    context = {
        'response': response,
        'question_responses': question_responses,
    }
    
    return render(request, 'questionnaires/response_detail.html', context) 