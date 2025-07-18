#!/usr/bin/env python
"""
Script para limpiar solo los datos de prueba creados, manteniendo usuarios reales existentes
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto, AplicacionProyecto, MiembroProyecto
from work_hours.models import WorkHour
from assignments.models import Assignment
from applications.models import Aplicacion, Asignacion
from notifications.models import Notification
from areas.models import Area
from trl_levels.models import TRLLevel
from project_status.models import ProjectStatus

User = get_user_model()

def limpiar_datos_prueba():
    """Limpiar solo los datos de prueba creados"""
    print("=== Limpiando datos de prueba ===")
    
    # Lista de emails de prueba que creamos
    emails_estudiantes_prueba = [
        'maria.garcia@estudiante.com',
        'carlos.rodriguez@estudiante.com',
        'ana.martinez@estudiante.com',
        'luis.hernandez@estudiante.com',
        'sofia.torres@estudiante.com',
        'juan.morales@estudiante.com',
        'patricia.flores@estudiante.com',
        'roberto.sanchez@estudiante.com'
    ]
    
    emails_empresas_prueba = [
        'contacto@techcorp.com',
        'info@innovatelab.com',
        'hello@digitalflow.com'
    ]
    
    # 1. Eliminar notificaciones de prueba
    print("1. Eliminando notificaciones de prueba...")
    notificaciones_eliminadas = 0
    for email in emails_estudiantes_prueba:
        try:
            user = User.objects.get(email=email)
            count = Notification.objects.filter(user=user).count()
            Notification.objects.filter(user=user).delete()
            notificaciones_eliminadas += count
            print(f"   - {count} notificaciones eliminadas para {email}")
        except User.DoesNotExist:
            pass
    
    # 2. Eliminar horas trabajadas de prueba
    print("2. Eliminando horas trabajadas de prueba...")
    horas_eliminadas = 0
    for email in emails_estudiantes_prueba:
        try:
            user = User.objects.get(email=email)
            estudiante = Estudiante.objects.get(user=user)
            count = WorkHour.objects.filter(student=estudiante).count()
            WorkHour.objects.filter(student=estudiante).delete()
            horas_eliminadas += count
            print(f"   - {count} horas trabajadas eliminadas para {email}")
        except (User.DoesNotExist, Estudiante.DoesNotExist):
            pass
    
    # 3. Eliminar asignaciones de prueba
    print("3. Eliminando asignaciones de prueba...")
    asignaciones_eliminadas = 0
    for email in emails_estudiantes_prueba:
        try:
            user = User.objects.get(email=email)
            count = Assignment.objects.filter(assigned_to=user).count()
            Assignment.objects.filter(assigned_to=user).delete()
            asignaciones_eliminadas += count
            print(f"   - {count} asignaciones eliminadas para {email}")
        except User.DoesNotExist:
            pass
    
    # 4. Eliminar aplicaciones de prueba
    print("4. Eliminando aplicaciones de prueba...")
    aplicaciones_eliminadas = 0
    for email in emails_estudiantes_prueba:
        try:
            user = User.objects.get(email=email)
            count = AplicacionProyecto.objects.filter(estudiante=user).count()
            AplicacionProyecto.objects.filter(estudiante=user).delete()
            aplicaciones_eliminadas += count
            print(f"   - {count} aplicaciones eliminadas para {email}")
        except User.DoesNotExist:
            pass
    
    # 5. Eliminar aplicaciones legacy de prueba
    print("5. Eliminando aplicaciones legacy de prueba...")
    aplicaciones_legacy_eliminadas = 0
    for email in emails_estudiantes_prueba:
        try:
            user = User.objects.get(email=email)
            estudiante = Estudiante.objects.get(user=user)
            count = Aplicacion.objects.filter(student=estudiante).count()
            Aplicacion.objects.filter(student=estudiante).delete()
            aplicaciones_legacy_eliminadas += count
            print(f"   - {count} aplicaciones legacy eliminadas para {email}")
        except (User.DoesNotExist, Estudiante.DoesNotExist):
            pass
    
    # 6. Eliminando asignaciones legacy de prueba...
    print("6. Eliminando asignaciones legacy de prueba...")
    asignaciones_legacy_eliminadas = 0
    # Las asignaciones legacy se eliminan automáticamente cuando se eliminan las aplicaciones
    print("   - Las asignaciones legacy se eliminan automáticamente con las aplicaciones")
    
    # 7. Eliminar miembros de proyecto de prueba
    print("7. Eliminando miembros de proyecto de prueba...")
    miembros_eliminados = 0
    for email in emails_estudiantes_prueba:
        try:
            user = User.objects.get(email=email)
            count = MiembroProyecto.objects.filter(usuario=user).count()
            MiembroProyecto.objects.filter(usuario=user).delete()
            miembros_eliminados += count
            print(f"   - {count} miembros de proyecto eliminados para {email}")
        except User.DoesNotExist:
            pass
    
    # 8. Eliminar proyectos de prueba (solo los que creamos)
    print("8. Eliminando proyectos de prueba...")
    proyectos_prueba = [
        'Sistema de Gestión de Inventarios',
        'Chatbot con IA para Atención al Cliente',
        'App Móvil de Fitness'
    ]
    proyectos_eliminados = 0
    for titulo in proyectos_prueba:
        count = Proyecto.objects.filter(title=titulo).count()
        Proyecto.objects.filter(title=titulo).delete()
        proyectos_eliminados += count
        print(f"   - {count} proyecto eliminado: {titulo}")
    
    # 9. Eliminar estudiantes de prueba
    print("9. Eliminando estudiantes de prueba...")
    estudiantes_eliminados = 0
    for email in emails_estudiantes_prueba:
        try:
            user = User.objects.get(email=email)
            Estudiante.objects.filter(user=user).delete()
            estudiantes_eliminados += 1
            print(f"   - Estudiante eliminado: {email}")
        except User.DoesNotExist:
            pass
    
    # 10. Eliminar empresas de prueba
    print("10. Eliminando empresas de prueba...")
    empresas_eliminadas = 0
    for email in emails_empresas_prueba:
        try:
            user = User.objects.get(email=email)
            Empresa.objects.filter(user=user).delete()
            empresas_eliminadas += 1
            print(f"   - Empresa eliminada: {email}")
        except User.DoesNotExist:
            pass
    
    # 11. Eliminar usuarios de prueba
    print("11. Eliminando usuarios de prueba...")
    usuarios_eliminados = 0
    for email in emails_estudiantes_prueba + emails_empresas_prueba:
        try:
            user = User.objects.get(email=email)
            user.delete()
            usuarios_eliminados += 1
            print(f"   - Usuario eliminado: {email}")
        except User.DoesNotExist:
            pass
    
    # 12. Limpiar áreas y TRL si están vacíos
    print("12. Verificando áreas y niveles TRL...")
    areas_vacias = Area.objects.filter(proyectos__isnull=True).count()
    trl_vacios = TRLLevel.objects.filter(proyectos__isnull=True).count()
    
    if areas_vacias > 0:
        Area.objects.filter(proyectos__isnull=True).delete()
        print(f"   - {areas_vacias} áreas vacías eliminadas")
    
    if trl_vacios > 0:
        TRLLevel.objects.filter(proyectos__isnull=True).delete()
        print(f"   - {trl_vacios} niveles TRL vacíos eliminados")
    
    # Resumen
    print("\n=== Resumen de limpieza ===")
    print(f"Notificaciones eliminadas: {notificaciones_eliminadas}")
    print(f"Horas trabajadas eliminadas: {horas_eliminadas}")
    print(f"Asignaciones eliminadas: {asignaciones_eliminadas}")
    print(f"Aplicaciones eliminadas: {aplicaciones_eliminadas}")
    print(f"Aplicaciones legacy eliminadas: {aplicaciones_legacy_eliminadas}")
    print(f"Asignaciones legacy eliminadas: {asignaciones_legacy_eliminadas}")
    print(f"Miembros de proyecto eliminados: {miembros_eliminados}")
    print(f"Proyectos eliminados: {proyectos_eliminados}")
    print(f"Estudiantes eliminados: {estudiantes_eliminados}")
    print(f"Empresas eliminadas: {empresas_eliminadas}")
    print(f"Usuarios eliminados: {usuarios_eliminados}")
    
    print("\n✅ Limpieza completada. Los datos de prueba han sido eliminados.")
    print("Los usuarios reales existentes se han mantenido intactos.")

if __name__ == '__main__':
    # Confirmar antes de eliminar
    print("⚠️  ADVERTENCIA: Este script eliminará todos los datos de prueba creados.")
    print("Los usuarios reales existentes NO serán afectados.")
    respuesta = input("¿Estás seguro de que quieres continuar? (sí/no): ")
    
    if respuesta.lower() in ['sí', 'si', 's', 'yes', 'y']:
        limpiar_datos_prueba()
    else:
        print("Operación cancelada.") 