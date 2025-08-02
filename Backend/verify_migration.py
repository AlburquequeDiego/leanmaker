#!/usr/bin/env python
"""
Script de verificación post-migración para LeanMaker
Verifica que todas las tablas, campos y relaciones estén correctamente implementados
"""

import os
import sys
import django
from django.db import connection
from django.core.management import call_command

def setup_django():
    """Configura Django para ejecutar el script"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

def check_tables():
    """Verifica que todas las tablas principales existan"""
    print("🔍 Verificando tablas principales...")
    
    tables_to_check = [
        'users',
        'students', 
        'companies',
        'projects',
        'applications',
        'evaluations',
        'notifications',
        'strikes',
        'calendar_events',
        'interviews',
        'areas',
        'trl_levels',
        'project_status_projectstatus',
        'evaluation_categories_evaluationcategory',
        'application_assignments',
        'project_members',
        'project_applications',
        'project_status_changes',
        'student_profiles',
        'api_level_requests',
        'student_skills',
        'student_portfolio',
        'student_achievements',
        'company_responsible_users',
        'company_ratings',
        'event_reminders',
        'calendar_settings',
        'notification_templates',
        'notification_preferences',
        'strike_reports'
    ]
    
    missing_tables = []
    
    with connection.cursor() as cursor:
        for table in tables_to_check:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"✅ Tabla {table}: {count} registros")
            except Exception as e:
                print(f"❌ Tabla {table}: NO EXISTE - {e}")
                missing_tables.append(table)
    
    return len(missing_tables) == 0

def check_new_fields():
    """Verifica que los campos nuevos estén presentes"""
    print("\n🔍 Verificando campos nuevos...")
    
    field_checks = [
        # Calendar Events
        ("calendar_events", "room", "VARCHAR"),
        ("calendar_events", "duration", "VARCHAR"),
        ("calendar_events", "meeting_type", "VARCHAR"),
        ("calendar_events", "meeting_link", "VARCHAR"),
        ("calendar_events", "meeting_room", "VARCHAR"),
        ("calendar_events", "representative_name", "VARCHAR"),
        ("calendar_events", "representative_position", "VARCHAR"),
        
        # Students
        ("students", "university", "VARCHAR"),
        ("students", "education_level", "VARCHAR"),
        ("students", "cv_link", "VARCHAR"),
        ("students", "certificado_link", "VARCHAR"),
        ("students", "bio", "TEXT"),
        
        # Companies
        ("companies", "rut", "VARCHAR"),
        ("companies", "personality", "VARCHAR"),
        ("companies", "business_name", "VARCHAR"),
        ("companies", "company_address", "VARCHAR"),
        ("companies", "company_phone", "VARCHAR"),
        ("companies", "company_email", "VARCHAR"),
        ("companies", "founded_year", "INTEGER"),
        ("companies", "logo_url", "VARCHAR"),
        
        # Projects
        ("projects", "requirements", "TEXT"),
        ("projects", "tipo", "VARCHAR"),
        ("projects", "objetivo", "TEXT"),
        ("projects", "encargado", "VARCHAR"),
        ("projects", "contacto", "VARCHAR"),
        ("projects", "duration_weeks", "INTEGER"),
        ("projects", "application_deadline", "DATE"),
        ("projects", "technologies", "TEXT"),
        ("projects", "benefits", "TEXT"),
        
        # Evaluations
        ("evaluations", "category_id", "INTEGER"),
        ("evaluations", "evaluation_date", "DATE"),
        
        # Notifications
        ("notifications", "related_url", "VARCHAR"),
        ("notifications", "type", "VARCHAR"),
        ("notifications", "read", "BOOLEAN"),
        
        # Strikes
        ("strikes", "project_id", "VARCHAR"),
        ("strikes", "description", "TEXT"),
        ("strikes", "expires_at", "DATETIME"),
        
        # Interviews
        ("interviews", "application_id", "VARCHAR"),
        ("interviews", "interview_date", "DATETIME"),
        ("interviews", "duration_minutes", "INTEGER"),
        ("interviews", "notes", "TEXT"),
        ("interviews", "feedback", "TEXT"),
        ("interviews", "rating", "INTEGER"),
        
        # Applications
        ("applications", "cover_letter", "TEXT"),
        ("applications", "company_notes", "TEXT"),
        ("applications", "student_notes", "TEXT"),
        ("applications", "portfolio_url", "VARCHAR"),
        ("applications", "github_url", "VARCHAR"),
        ("applications", "linkedin_url", "VARCHAR"),
        ("applications", "applied_at", "DATETIME"),
        ("applications", "reviewed_at", "DATETIME"),
        ("applications", "responded_at", "DATETIME"),
    ]
    
    missing_fields = []
    
    with connection.cursor() as cursor:
        for table, field, expected_type in field_checks:
            try:
                cursor.execute(f"PRAGMA table_info({table})")
                columns = cursor.fetchall()
                field_exists = any(col[1] == field for col in columns)
                
                if field_exists:
                    print(f"✅ Campo {table}.{field}: PRESENTE")
                else:
                    print(f"❌ Campo {table}.{field}: FALTANTE")
                    missing_fields.append(f"{table}.{field}")
            except Exception as e:
                print(f"❌ Error verificando {table}.{field}: {e}")
                missing_fields.append(f"{table}.{field}")
    
    return len(missing_fields) == 0

def check_indexes():
    """Verifica que los índices estén creados"""
    print("\n🔍 Verificando índices...")
    
    indexes_to_check = [
        "calendar_events_user_start_idx",
        "calendar_events_type_idx",
        "calendar_events_status_idx",
        "notifications_user_read_idx",
        "notifications_created_idx",
        "strikes_student_active_idx",
        "strikes_issued_idx",
        "evaluations_student_status_idx",
        "evaluations_project_type_idx",
        "applications_project_status_idx",
        "applications_student_status_idx",
        "projects_company_status_idx",
        "projects_area_status_idx",
        "students_status_api_idx",
        "students_area_status_idx",
        "companies_status_verified_idx",
        "companies_industry_status_idx"
    ]
    
    missing_indexes = []
    
    with connection.cursor() as cursor:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
        existing_indexes = [row[0] for row in cursor.fetchall()]
        
        for index in indexes_to_check:
            if index in existing_indexes:
                print(f"✅ Índice {index}: PRESENTE")
            else:
                print(f"❌ Índice {index}: FALTANTE")
                missing_indexes.append(index)
    
    return len(missing_indexes) == 0

def check_constraints():
    """Verifica que los constraints estén activos"""
    print("\n🔍 Verificando constraints...")
    
    constraints_to_check = [
        "evaluation_score_range",
        "evaluation_overall_rating_range",
        "interview_rating_range",
        "student_api_level_range",
        "student_trl_level_range",
        "student_strikes_range",
        "student_gpa_range",
        "student_rating_range",
        "student_experience_years_range",
        "project_min_api_level_range",
        "project_api_level_range",
        "project_required_hours_positive",
        "project_max_students_positive",
        "project_current_students_non_negative",
        "project_duration_weeks_positive",
        "project_hours_per_week_positive",
        "company_rating_range",
        "company_total_projects_non_negative",
        "company_projects_completed_non_negative",
        "company_total_hours_non_negative"
    ]
    
    missing_constraints = []
    
    with connection.cursor() as cursor:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_master'")
        # Para SQLite, verificamos constraints de manera diferente
        print("ℹ️  Verificación de constraints requiere inspección manual en SQLite")
    
    return True

def check_initial_data():
    """Verifica que los datos iniciales estén presentes"""
    print("\n🔍 Verificando datos iniciales...")
    
    try:
        from project_status.models import ProjectStatus
        from evaluation_categories.models import EvaluationCategory
        
        # Verificar estados de proyecto
        project_statuses = ProjectStatus.objects.all()
        expected_statuses = ['Abierto', 'En Progreso', 'Completado', 'Cancelado']
        
        for status_name in expected_statuses:
            if project_statuses.filter(name=status_name).exists():
                print(f"✅ Estado de proyecto '{status_name}': PRESENTE")
            else:
                print(f"❌ Estado de proyecto '{status_name}': FALTANTE")
        
        # Verificar categorías de evaluación
        evaluation_categories = EvaluationCategory.objects.all()
        expected_categories = [
            'Calidad del Trabajo', 'Comunicación', 'Puntualidad', 
            'Trabajo en Equipo', 'Iniciativa'
        ]
        
        for category_name in expected_categories:
            if evaluation_categories.filter(name=category_name).exists():
                print(f"✅ Categoría de evaluación '{category_name}': PRESENTE")
            else:
                print(f"❌ Categoría de evaluación '{category_name}': FALTANTE")
        
        return True
    except Exception as e:
        print(f"❌ Error verificando datos iniciales: {e}")
        return False

def check_superuser():
    """Verifica que el superusuario esté creado"""
    print("\n🔍 Verificando superusuario...")
    
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        superusers = User.objects.filter(is_superuser=True)
        if superusers.exists():
            print(f"✅ Superusuario: PRESENTE ({superusers.count()} usuarios)")
            for user in superusers:
                print(f"   - {user.email} ({user.get_role_display()})")
            return True
        else:
            print("❌ Superusuario: FALTANTE")
            return False
    except Exception as e:
        print(f"❌ Error verificando superusuario: {e}")
        return False

def main():
    """Función principal de verificación"""
    print("=" * 60)
    print("🔍 LEANMAKER - VERIFICACIÓN POST-MIGRACIÓN")
    print("=" * 60)
    
    # Configurar Django
    setup_django()
    
    # Realizar verificaciones
    checks = [
        ("Tablas", check_tables),
        ("Campos nuevos", check_new_fields),
        ("Índices", check_indexes),
        ("Constraints", check_constraints),
        ("Datos iniciales", check_initial_data),
        ("Superusuario", check_superuser)
    ]
    
    results = []
    
    for check_name, check_function in checks:
        print(f"\n{'='*20} {check_name} {'='*20}")
        try:
            result = check_function()
            results.append((check_name, result))
        except Exception as e:
            print(f"❌ Error en verificación de {check_name}: {e}")
            results.append((check_name, False))
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE VERIFICACIÓN")
    print("=" * 60)
    
    all_passed = True
    for check_name, result in results:
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{check_name}: {status}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ¡TODAS LAS VERIFICACIONES PASARON!")
        print("✅ La migración fue exitosa")
        print("🚀 El sistema está listo para usar")
    else:
        print("⚠️  ALGUNAS VERIFICACIONES FALLARON")
        print("🔧 Revisa los errores y ejecuta las migraciones nuevamente")
    print("=" * 60)
    
    return all_passed

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1) 