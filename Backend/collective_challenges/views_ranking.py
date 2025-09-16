"""
🎯 ENDPOINTS PARA RANKINGS DE DESAFÍOS COLECTIVOS

Este archivo contiene endpoints específicos para rankings y estadísticas
de desafíos colectivos.
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Count, Avg, Sum, Q, F
from django.utils import timezone
from core.views import verify_token
import json


@csrf_exempt
@require_http_methods(["GET"])
def api_collective_challenges_ranking(request):
    """API endpoint para ranking de desafíos colectivos."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        from collective_challenges.models import DesafioColectivo, ChallengeProgress, StudentGroup
        from students.models import Estudiante
        from companies.models import Empresa
        
        # 1. Top 20 equipos/grupos en desafíos colectivos
        top_teams = []
        try:
            teams_with_progress = StudentGroup.objects.annotate(
                total_challenges=Count('group_progress__challenge', distinct=True),
                completed_challenges=Count('group_progress__challenge', 
                    filter=Q(group_progress__status='completed'), distinct=True),
                avg_progress=Avg('group_progress__overall_progress'),
                total_members=Count('members', distinct=True)
            ).filter(total_challenges__gt=0).order_by('-avg_progress', '-completed_challenges')[:20]
            
            for i, team in enumerate(teams_with_progress):
                top_teams.append({
                    'position': i + 1,
                    'team_name': team.name,
                    'team_id': str(team.id),
                    'total_challenges': team.total_challenges,
                    'completed_challenges': team.completed_challenges,
                    'avg_progress': round(team.avg_progress or 0, 2),
                    'total_members': team.total_members,
                    'completion_rate': round((team.completed_challenges / team.total_challenges * 100) if team.total_challenges > 0 else 0, 2),
                    'performance_score': round((team.avg_progress or 0) * (team.completed_challenges / team.total_challenges) if team.total_challenges > 0 else 0, 2)
                })
        except Exception as e:
            print(f"⚠️ Error obteniendo top teams: {str(e)}")
            top_teams = []
        
        # 2. Top 20 estudiantes individuales en desafíos colectivos
        top_students_individual = []
        try:
            students_with_challenges = Estudiante.objects.annotate(
                total_challenges=Count('challenge_progress__challenge', distinct=True),
                completed_challenges=Count('challenge_progress__challenge', 
                    filter=Q(challenge_progress__status='completed'), distinct=True),
                avg_progress=Avg('challenge_progress__overall_progress'),
                total_hours=Sum('challenge_progress__total_hours_spent')
            ).filter(total_challenges__gt=0).order_by('-avg_progress', '-completed_challenges')[:20]
            
            for i, student in enumerate(students_with_challenges):
                top_students_individual.append({
                    'position': i + 1,
                    'student_id': str(student.id),
                    'student_name': student.user.full_name,
                    'student_email': student.user.email,
                    'total_challenges': student.total_challenges,
                    'completed_challenges': student.completed_challenges,
                    'avg_progress': round(student.avg_progress or 0, 2),
                    'total_hours': student.total_hours or 0,
                    'completion_rate': round((student.completed_challenges / student.total_challenges * 100) if student.total_challenges > 0 else 0, 2),
                    'performance_score': round((student.avg_progress or 0) * (student.completed_challenges / student.total_challenges) if student.total_challenges > 0 else 0, 2)
                })
        except Exception as e:
            print(f"⚠️ Error obteniendo top students individual: {str(e)}")
            top_students_individual = []
        
        # 3. Top 20 empresas por desafíos colectivos creados
        top_companies_challenges = []
        try:
            companies_with_challenges = Empresa.objects.annotate(
                total_challenges=Count('desafios_colectivos'),
                active_challenges=Count('desafios_colectivos', filter=Q(desafios_colectivos__status='active')),
                completed_challenges=Count('desafios_colectivos', filter=Q(desafios_colectivos__status='completed')),
                total_applications=Sum('desafios_colectivos__applications_count'),
                avg_applications_per_challenge=Avg('desafios_colectivos__applications_count')
            ).filter(total_challenges__gt=0).order_by('-total_challenges', '-total_applications')[:20]
            
            for i, company in enumerate(companies_with_challenges):
                top_companies_challenges.append({
                    'position': i + 1,
                    'company_id': str(company.id),
                    'company_name': company.company_name,
                    'company_industry': company.industry,
                    'total_challenges': company.total_challenges,
                    'active_challenges': company.active_challenges,
                    'completed_challenges': company.completed_challenges,
                    'total_applications': company.total_applications or 0,
                    'avg_applications_per_challenge': round(company.avg_applications_per_challenge or 0, 2),
                    'activity_score': company.total_challenges * 2 + (company.total_applications or 0)
                })
        except Exception as e:
            print(f"⚠️ Error obteniendo top companies challenges: {str(e)}")
            top_companies_challenges = []
        
        # 4. Estadísticas generales de desafíos colectivos
        general_stats = {}
        try:
            total_challenges = DesafioColectivo.objects.count()
            active_challenges = DesafioColectivo.objects.filter(status='active').count()
            completed_challenges = DesafioColectivo.objects.filter(status='completed').count()
            total_applications = DesafioColectivo.objects.aggregate(total=Sum('applications_count'))['total'] or 0
            total_views = DesafioColectivo.objects.aggregate(total=Sum('views_count'))['total'] or 0
            
            # Progreso promedio de todos los estudiantes
            avg_progress_all = ChallengeProgress.objects.aggregate(avg=Avg('overall_progress'))['avg'] or 0
            
            general_stats = {
                'total_challenges': total_challenges,
                'active_challenges': active_challenges,
                'completed_challenges': completed_challenges,
                'total_applications': total_applications,
                'total_views': total_views,
                'avg_progress_all_students': round(avg_progress_all, 2),
                'completion_rate': round((completed_challenges / total_challenges * 100) if total_challenges > 0 else 0, 2)
            }
        except Exception as e:
            print(f"⚠️ Error obteniendo estadísticas generales: {str(e)}")
            general_stats = {}
        
        return JsonResponse({
            'success': True,
            'data': {
                'top_teams': top_teams,
                'top_students_individual': top_students_individual,
                'top_companies_challenges': top_companies_challenges,
                'general_stats': general_stats,
                'last_updated': timezone.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"❌ Error en api_collective_challenges_ranking: {str(e)}")
        import traceback
        return JsonResponse({
            'error': 'Error interno del servidor',
            'details': str(e),
            'traceback': traceback.format_exc()
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_teachers_ranking(request):
    """API endpoint para ranking de profesores del sistema."""
    try:
        # Verificar autenticación
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user or user.role != 'admin':
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
        
        from teachers.models import TeacherStudent, TeacherProject, TeacherEvaluation
        from users.models import User
        from django.db.models import Count, Avg, Sum, Q, F
        
        # 1. Top 20 profesores por actividad y supervisión
        top_teachers = []
        try:
            teachers_with_stats = User.objects.filter(role='teacher').annotate(
                total_students_supervised=Count('supervised_students', distinct=True),
                active_students=Count('supervised_students', filter=Q(supervised_students__status='active'), distinct=True),
                completed_supervisions=Count('supervised_students', filter=Q(supervised_students__status='completed'), distinct=True),
                total_projects_supervised=Count('supervised_projects', distinct=True),
                total_evaluations=Count('teacher_evaluations', distinct=True),
                avg_evaluation_score=Avg('teacher_evaluations__overall_score'),
                total_hours_supervised=Sum('supervised_students__total_hours_supervised'),
                total_meetings=Sum('supervised_students__meetings_count')
            ).filter(total_students_supervised__gt=0).order_by('-total_students_supervised', '-avg_evaluation_score')[:20]
            
            for i, teacher in enumerate(teachers_with_stats):
                # Calcular puntuación de rendimiento
                performance_score = (
                    (teacher.total_students_supervised or 0) * 2 +
                    (teacher.total_projects_supervised or 0) * 3 +
                    (teacher.total_evaluations or 0) * 1 +
                    (teacher.avg_evaluation_score or 0) * 10 +
                    (teacher.completed_supervisions or 0) * 5
                )
                
                top_teachers.append({
                    'position': i + 1,
                    'teacher_id': str(teacher.id),
                    'teacher_name': teacher.full_name,
                    'teacher_email': teacher.email,
                    'total_students_supervised': teacher.total_students_supervised or 0,
                    'active_students': teacher.active_students or 0,
                    'completed_supervisions': teacher.completed_supervisions or 0,
                    'total_projects_supervised': teacher.total_projects_supervised or 0,
                    'total_evaluations': teacher.total_evaluations or 0,
                    'avg_evaluation_score': round(teacher.avg_evaluation_score or 0, 2),
                    'total_hours_supervised': teacher.total_hours_supervised or 0,
                    'total_meetings': teacher.total_meetings or 0,
                    'performance_score': round(performance_score, 2),
                    'success_rate': round(
                        ((teacher.completed_supervisions or 0) / (teacher.total_students_supervised or 1) * 100), 2
                    )
                })
        except Exception as e:
            print(f"⚠️ Error obteniendo top teachers: {str(e)}")
            top_teachers = []
        
        # 2. Estadísticas generales de profesores
        general_stats = {}
        try:
            total_teachers = User.objects.filter(role='teacher').count()
            active_teachers = User.objects.filter(
                role='teacher', 
                supervised_students__status='active'
            ).distinct().count()
            
            total_supervisions = TeacherStudent.objects.count()
            active_supervisions = TeacherStudent.objects.filter(status='active').count()
            completed_supervisions = TeacherStudent.objects.filter(status='completed').count()
            
            total_evaluations = TeacherEvaluation.objects.count()
            avg_evaluation_score = TeacherEvaluation.objects.aggregate(
                avg=Avg('overall_score')
            )['avg'] or 0
            
            total_hours_supervised = TeacherStudent.objects.aggregate(
                total=Sum('total_hours_supervised')
            )['total'] or 0
            
            general_stats = {
                'total_teachers': total_teachers,
                'active_teachers': active_teachers,
                'total_supervisions': total_supervisions,
                'active_supervisions': active_supervisions,
                'completed_supervisions': completed_supervisions,
                'total_evaluations': total_evaluations,
                'avg_evaluation_score': round(avg_evaluation_score, 2),
                'total_hours_supervised': total_hours_supervised,
                'supervision_success_rate': round(
                    (completed_supervisions / total_supervisions * 100) if total_supervisions > 0 else 0, 2
                )
            }
        except Exception as e:
            print(f"⚠️ Error obteniendo estadísticas generales de profesores: {str(e)}")
            general_stats = {}
        
        # 3. Top profesores por especialización (basado en tipos de supervisión)
        teachers_by_specialization = []
        try:
            specialization_stats = TeacherStudent.objects.values('supervision_type').annotate(
                count=Count('id'),
                teachers_count=Count('teacher', distinct=True),
                avg_hours=Avg('total_hours_supervised')
            ).order_by('-count')
            
            for spec in specialization_stats:
                teachers_by_specialization.append({
                    'specialization': spec['supervision_type'],
                    'total_supervisions': spec['count'],
                    'teachers_count': spec['teachers_count'],
                    'avg_hours_per_supervision': round(spec['avg_hours'] or 0, 2)
                })
        except Exception as e:
            print(f"⚠️ Error obteniendo especializaciones: {str(e)}")
            teachers_by_specialization = []
        
        return JsonResponse({
            'success': True,
            'data': {
                'top_teachers': top_teachers,
                'general_stats': general_stats,
                'teachers_by_specialization': teachers_by_specialization,
                'last_updated': timezone.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"❌ Error en api_teachers_ranking: {str(e)}")
        import traceback
        return JsonResponse({
            'error': 'Error interno del servidor',
            'details': str(e),
            'traceback': traceback.format_exc()
        }, status=500)
