#!/usr/bin/env python
"""
Script para reparar y sincronizar todos los ratings y GPAs de empresas y estudiantes
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from companies.models import Empresa
from students.models import Estudiante
from evaluations.models import Evaluation
from projects.models import Proyecto
from django.db import transaction

def reparar_ratings_empresas():
    """Repara los ratings de todas las empresas"""
    print("🔧 REPARANDO RATINGS DE EMPRESAS")
    print("=" * 50)
    
    empresas = Empresa.objects.all()
    empresas_reparadas = 0
    empresas_con_problemas = 0
    
    for empresa in empresas:
        print(f"\n📊 Empresa: {empresa.company_name}")
        
        # Rating actual en BD
        rating_actual = empresa.rating
        print(f"  - Rating actual en BD: {rating_actual}")
        
        # Buscar evaluaciones reales
        evaluaciones = Evaluation.objects.filter(
            project__company=empresa,
            status='completed',
            evaluation_type='student_to_company'
        )
        print(f"  - Evaluaciones encontradas: {evaluaciones.count()}")
        
        if evaluaciones.exists():
            # Calcular rating real
            scores = [e.score for e in evaluaciones]
            rating_real = round(sum(scores) / len(scores), 2)
            print(f"  - Rating calculado: {rating_real}")
            print(f"  - Scores: {scores}")
            
            # Verificar si hay diferencia
            if rating_actual != rating_real:
                print(f"  ⚠️  PROBLEMA: Rating en BD ({rating_actual}) != Rating real ({rating_real})")
                
                # Reparar
                try:
                    with transaction.atomic():
                        empresa.rating = rating_real
                        empresa.save(update_fields=['rating'])
                        empresa.refresh_from_db()
                        print(f"  ✅ REPARADO: Rating actualizado a {empresa.rating}")
                        empresas_reparadas += 1
                except Exception as e:
                    print(f"  ❌ Error reparando: {e}")
                    empresas_con_problemas += 1
            else:
                print(f"  ✅ Rating correcto")
        else:
            # No hay evaluaciones, rating debe ser 0
            if rating_actual != 0:
                print(f"  ⚠️  PROBLEMA: No hay evaluaciones pero rating = {rating_actual}")
                
                try:
                    with transaction.atomic():
                        empresa.rating = 0
                        empresa.save(update_fields=['rating'])
                        empresa.refresh_from_db()
                        print(f"  ✅ REPARADO: Rating actualizado a 0")
                        empresas_reparadas += 1
                except Exception as e:
                    print(f"  ❌ Error reparando: {e}")
                    empresas_con_problemas += 1
            else:
                print(f"  ✅ Rating correcto (0)")
    
    print(f"\n📈 RESUMEN EMPRESAS:")
    print(f"  - Total empresas: {empresas.count()}")
    print(f"  - Reparadas: {empresas_reparadas}")
    print(f"  - Con problemas: {empresas_con_problemas}")
    
    return empresas_reparadas, empresas_con_problemas

def reparar_gpas_estudiantes():
    """Repara los GPAs de todos los estudiantes"""
    print("\n🔧 REPARANDO GPAS DE ESTUDIANTES")
    print("=" * 50)
    
    estudiantes = Estudiante.objects.all()
    estudiantes_reparados = 0
    estudiantes_con_problemas = 0
    
    for estudiante in estudiantes:
        print(f"\n📊 Estudiante: {estudiante.user.full_name}")
        
        # GPA actual en BD
        gpa_actual = estudiante.gpa
        print(f"  - GPA actual en BD: {gpa_actual}")
        
        # Buscar evaluaciones reales
        evaluaciones = Evaluation.objects.filter(
            student=estudiante,
            status='completed',
            evaluation_type='company_to_student'
        )
        print(f"  - Evaluaciones encontradas: {evaluaciones.count()}")
        
        if evaluaciones.exists():
            # Calcular GPA real
            scores = [e.score for e in evaluaciones]
            gpa_real = round(sum(scores) / len(scores), 2)
            print(f"  - GPA calculado: {gpa_real}")
            print(f"  - Scores: {scores}")
            
            # Verificar si hay diferencia
            if gpa_actual != gpa_real:
                print(f"  ⚠️  PROBLEMA: GPA en BD ({gpa_actual}) != GPA real ({gpa_real})")
                
                # Reparar
                try:
                    with transaction.atomic():
                        estudiante.gpa = gpa_real
                        estudiante.save(update_fields=['gpa'])
                        estudiante.refresh_from_db()
                        print(f"  ✅ REPARADO: GPA actualizado a {estudiante.gpa}")
                        estudiantes_reparados += 1
                except Exception as e:
                    print(f"  ❌ Error reparando: {e}")
                    estudiantes_con_problemas += 1
            else:
                print(f"  ✅ GPA correcto")
        else:
            # No hay evaluaciones, GPA debe ser 0
            if gpa_actual != 0:
                print(f"  ⚠️  PROBLEMA: No hay evaluaciones pero GPA = {gpa_actual}")
                
                try:
                    with transaction.atomic():
                        estudiante.gpa = 0
                        estudiante.save(update_fields=['gpa'])
                        estudiante.refresh_from_db()
                        print(f"  ✅ REPARADO: GPA actualizado a 0")
                        estudiantes_reparados += 1
                except Exception as e:
                    print(f"  ❌ Error reparando: {e}")
                    estudiantes_con_problemas += 1
            else:
                print(f"  ✅ GPA correcto (0)")
    
    print(f"\n📈 RESUMEN ESTUDIANTES:")
    print(f"  - Total estudiantes: {estudiantes.count()}")
    print(f"  - Reparados: {estudiantes_reparados}")
    print(f"  - Con problemas: {estudiantes_con_problemas}")
    
    return estudiantes_reparados, estudiantes_con_problemas

def verificar_consistencia():
    """Verifica la consistencia general del sistema"""
    print("\n🔍 VERIFICANDO CONSISTENCIA DEL SISTEMA")
    print("=" * 50)
    
    # Verificar evaluaciones
    total_evaluaciones = Evaluation.objects.count()
    company_to_student = Evaluation.objects.filter(evaluation_type='company_to_student').count()
    student_to_company = Evaluation.objects.filter(evaluation_type='student_to_company').count()
    
    print(f"📊 EVALUACIONES:")
    print(f"  - Total: {total_evaluaciones}")
    print(f"  - Empresa → Estudiante: {company_to_student}")
    print(f"  - Estudiante → Empresa: {student_to_company}")
    
    # Verificar proyectos
    total_proyectos = Proyecto.objects.count()
    proyectos_con_evaluaciones = Proyecto.objects.filter(evaluations__isnull=False).distinct().count()
    
    print(f"\n📊 PROYECTOS:")
    print(f"  - Total: {total_proyectos}")
    print(f"  - Con evaluaciones: {proyectos_con_evaluaciones}")
    
    # Verificar empresas
    total_empresas = Empresa.objects.count()
    empresas_con_evaluaciones = Empresa.objects.filter(
        proyectos__evaluations__evaluation_type='student_to_company',
        proyectos__evaluations__status='completed'
    ).distinct().count()
    
    print(f"\n📊 EMPRESAS:")
    print(f"  - Total: {total_empresas}")
    print(f"  - Con evaluaciones: {empresas_con_evaluaciones}")
    
    # Verificar estudiantes
    total_estudiantes = Estudiante.objects.count()
    estudiantes_con_evaluaciones = Estudiante.objects.filter(
        evaluations_received__evaluation_type='company_to_student',
        evaluations_received__status='completed'
    ).distinct().count()
    
    print(f"\n📊 ESTUDIANTES:")
    print(f"  - Total: {total_estudiantes}")
    print(f"  - Con evaluaciones: {estudiantes_con_evaluaciones}")

def crear_backup_ratings():
    """Crea un backup de los ratings actuales antes de reparar"""
    print("\n💾 CREANDO BACKUP DE RATINGS ACTUALES")
    print("=" * 50)
    
    backup_data = {
        'empresas': [],
        'estudiantes': []
    }
    
    # Backup empresas
    for empresa in Empresa.objects.all():
        backup_data['empresas'].append({
            'id': str(empresa.id),
            'company_name': empresa.company_name,
            'rating_original': float(empresa.rating),
            'fecha_backup': empresa.updated_at.isoformat()
        })
    
    # Backup estudiantes
    for estudiante in Estudiante.objects.all():
        backup_data['estudiantes'].append({
            'id': str(estudiante.id),
            'full_name': estudiante.user.full_name,
            'gpa_original': float(estudiante.gpa),
            'fecha_backup': estudiante.updated_at.isoformat()
        })
    
    # Guardar backup en archivo
    import json
    from datetime import datetime
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_ratings_{timestamp}.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Backup creado: {filename}")
    print(f"  - Empresas: {len(backup_data['empresas'])}")
    print(f"  - Estudiantes: {len(backup_data['estudiantes'])}")
    
    return filename

def main():
    """Función principal"""
    print("🚀 INICIANDO REPARACIÓN COMPLETA DEL SISTEMA DE RATINGS")
    print("=" * 60)
    
    try:
        # 1. Crear backup
        backup_file = crear_backup_ratings()
        
        # 2. Verificar consistencia antes
        verificar_consistencia()
        
        # 3. Reparar empresas
        empresas_reparadas, empresas_problemas = reparar_ratings_empresas()
        
        # 4. Reparar estudiantes
        estudiantes_reparados, estudiantes_problemas = reparar_gpas_estudiantes()
        
        # 5. Verificar consistencia después
        verificar_consistencia()
        
        # 6. Resumen final
        print("\n🎉 REPARACIÓN COMPLETADA")
        print("=" * 60)
        print(f"📊 RESUMEN FINAL:")
        print(f"  - Empresas reparadas: {empresas_reparadas}")
        print(f"  - Empresas con problemas: {empresas_problemas}")
        print(f"  - Estudiantes reparados: {estudiantes_reparados}")
        print(f"  - Estudiantes con problemas: {estudiantes_problemas}")
        print(f"  - Backup guardado en: {backup_file}")
        
        if empresas_problemas == 0 and estudiantes_problemas == 0:
            print("\n✅ ¡SISTEMA COMPLETAMENTE REPARADO!")
        else:
            print(f"\n⚠️  {empresas_problemas + estudiantes_problemas} problemas no pudieron ser resueltos")
            print("   Revisa los logs anteriores para más detalles")
        
    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
