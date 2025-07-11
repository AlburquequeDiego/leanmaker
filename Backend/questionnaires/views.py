"""
Views para la app questionnaires.
"""

import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db.models import Q, Count
from .models import Questionnaire, Question, Choice, Answer
from .serializers import QuestionnaireSerializer, QuestionSerializer, ChoiceSerializer, AnswerSerializer
from users.models import User
from core.auth_utils import get_user_from_token, require_auth, require_admin

# --- CUESTIONARIOS ---

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def questionnaires_list(request):
    """Lista cuestionarios con filtros y paginación"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query base
        queryset = Questionnaire.objects.prefetch_related('questions')
        
        # Aplicar filtros
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('-created_at')[offset:offset + limit]
        
        # Serializar resultados
        data = [QuestionnaireSerializer.to_dict(questionnaire) for questionnaire in queryset]
        
        return JsonResponse({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al listar cuestionarios: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def questionnaires_detail(request, questionnaire_id):
    """Obtiene los detalles de un cuestionario específico"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            questionnaire_uuid = uuid.UUID(questionnaire_id)
        except ValueError:
            return JsonResponse({'error': 'ID de cuestionario inválido'}, status=400)
        
        # Buscar cuestionario
        try:
            questionnaire = Questionnaire.objects.prefetch_related('questions__choices').get(id=questionnaire_uuid)
        except Questionnaire.DoesNotExist:
            return JsonResponse({'error': 'Cuestionario no encontrado'}, status=404)
        
        return JsonResponse({
            'success': True,
            'data': QuestionnaireSerializer.to_dict(questionnaire)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al obtener cuestionario: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def questionnaires_create(request):
    """Crea un nuevo cuestionario"""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = QuestionnaireSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear cuestionario
        questionnaire = QuestionnaireSerializer.create(data)
        
        return JsonResponse({
            'success': True,
            'message': 'Cuestionario creado exitosamente',
            'data': QuestionnaireSerializer.to_dict(questionnaire)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear cuestionario: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
@require_admin
def questionnaires_update(request, questionnaire_id):
    """Actualiza un cuestionario existente"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            questionnaire_uuid = uuid.UUID(questionnaire_id)
        except ValueError:
            return JsonResponse({'error': 'ID de cuestionario inválido'}, status=400)
        
        # Buscar cuestionario
        try:
            questionnaire = Questionnaire.objects.get(id=questionnaire_uuid)
        except Questionnaire.DoesNotExist:
            return JsonResponse({'error': 'Cuestionario no encontrado'}, status=404)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = QuestionnaireSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Actualizar cuestionario
        questionnaire = QuestionnaireSerializer.update(questionnaire, data)
        
        return JsonResponse({
            'success': True,
            'message': 'Cuestionario actualizado exitosamente',
            'data': QuestionnaireSerializer.to_dict(questionnaire)
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al actualizar cuestionario: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
@require_admin
def questionnaires_delete(request, questionnaire_id):
    """Elimina un cuestionario"""
    try:
        user = get_user_from_token(request)
        
        # Validar UUID
        try:
            questionnaire_uuid = uuid.UUID(questionnaire_id)
        except ValueError:
            return JsonResponse({'error': 'ID de cuestionario inválido'}, status=400)
        
        # Buscar cuestionario
        try:
            questionnaire = Questionnaire.objects.get(id=questionnaire_uuid)
        except Questionnaire.DoesNotExist:
            return JsonResponse({'error': 'Cuestionario no encontrado'}, status=404)
        
        # Eliminar cuestionario
        questionnaire.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Cuestionario eliminado exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al eliminar cuestionario: {str(e)}'}, status=500)

# --- PREGUNTAS ---

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def questions_list(request):
    """Lista preguntas con filtros y paginación"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        questionnaire_id = request.GET.get('questionnaire_id')
        question_type = request.GET.get('question_type')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query base
        queryset = Question.objects.select_related('questionnaire').prefetch_related('choices')
        
        # Aplicar filtros
        if questionnaire_id:
            queryset = queryset.filter(questionnaire_id=questionnaire_id)
        if question_type:
            queryset = queryset.filter(question_type=question_type)
        if search:
            queryset = queryset.filter(text__icontains=search)
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('id')[offset:offset + limit]
        
        # Serializar resultados
        data = [QuestionSerializer.to_dict(question) for question in queryset]
        
        return JsonResponse({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al listar preguntas: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_admin
def questions_create(request):
    """Crea una nueva pregunta"""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = QuestionSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Validar questionnaire_id
        questionnaire_id = data.get('questionnaire_id')
        if not questionnaire_id:
            return JsonResponse({'error': 'questionnaire_id es requerido'}, status=400)
        
        try:
            questionnaire = Questionnaire.objects.get(id=questionnaire_id)
        except Questionnaire.DoesNotExist:
            return JsonResponse({'error': 'Cuestionario no encontrado'}, status=404)
        
        # Crear pregunta
        question = QuestionSerializer.create(data, questionnaire)
        
        return JsonResponse({
            'success': True,
            'message': 'Pregunta creada exitosamente',
            'data': QuestionSerializer.to_dict(question)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear pregunta: {str(e)}'}, status=500)

# --- RESPUESTAS ---

@csrf_exempt
@require_http_methods(["GET"])
@require_auth
def answers_list(request):
    """Lista respuestas del usuario con filtros y paginación"""
    try:
        user = get_user_from_token(request)
        
        # Filtros
        question_id = request.GET.get('question_id')
        questionnaire_id = request.GET.get('questionnaire_id')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Construir query base
        if user.role == 'admin':
            queryset = Answer.objects.select_related('user', 'question').prefetch_related('selected_choices')
        else:
            queryset = Answer.objects.select_related('user', 'question').prefetch_related('selected_choices').filter(user=user)
        
        # Aplicar filtros
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        if questionnaire_id:
            queryset = queryset.filter(question__questionnaire_id=questionnaire_id)
        
        # Paginación
        total = queryset.count()
        offset = (page - 1) * limit
        queryset = queryset.order_by('-id')[offset:offset + limit]
        
        # Serializar resultados
        data = [AnswerSerializer.to_dict(answer) for answer in queryset]
        
        return JsonResponse({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error al listar respuestas: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def answers_create(request):
    """Crea una nueva respuesta"""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        # Validar datos
        errors = AnswerSerializer.validate_data(data)
        if errors:
            return JsonResponse({'error': 'Datos inválidos', 'details': errors}, status=400)
        
        # Crear respuesta
        answer = AnswerSerializer.create(data, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Respuesta creada exitosamente',
            'data': AnswerSerializer.to_dict(answer)
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al crear respuesta: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@require_auth
def submit_questionnaire_response(request):
    """Envía respuestas completas a un cuestionario"""
    try:
        user = get_user_from_token(request)
        
        # Parsear datos
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
        
        questionnaire_id = data.get('questionnaire_id')
        answers_data = data.get('answers', [])
        
        if not questionnaire_id:
            return JsonResponse({'error': 'questionnaire_id es requerido'}, status=400)
        
        if not answers_data:
            return JsonResponse({'error': 'Debe proporcionar al menos una respuesta'}, status=400)
        
        # Validar que el cuestionario existe
        try:
            questionnaire = Questionnaire.objects.get(id=questionnaire_id)
        except Questionnaire.DoesNotExist:
            return JsonResponse({'error': 'Cuestionario no encontrado'}, status=404)
        
        # Procesar respuestas
        created_answers = []
        for answer_data in answers_data:
            answer_data['question_id'] = answer_data.get('question_id')
            if not answer_data['question_id']:
                continue
            
            # Validar datos de la respuesta
            errors = AnswerSerializer.validate_data(answer_data)
            if errors:
                return JsonResponse({'error': 'Datos inválidos en respuestas', 'details': errors}, status=400)
            
            # Crear respuesta
            answer = AnswerSerializer.create(answer_data, user)
            created_answers.append(AnswerSerializer.to_dict(answer))
        
        return JsonResponse({
            'success': True,
            'message': f'{len(created_answers)} respuestas enviadas exitosamente',
            'data': created_answers
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': f'Error al enviar respuestas: {str(e)}'}, status=500)
