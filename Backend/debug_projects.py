#!/usr/bin/env python
"""
Script de debug para verificar los datos de proyectos y estudiantes
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto, MiembroProyecto
from applications.models import Aplicacion
from users.models import User
from companies.models import Empresa

def debug_projects():
    """Debug de proyectos y estudiantes"""
    print("🔍 DEBUG: Verificando proyectos y estudiantes")
    print("=" * 50)
    
    # Obtener todas las empresas
    empresas = Empresa.objects.all()
    print(f"📊 Total de empresas: {empresas.count()}")
    
    for empresa in empresas:
        print(f"\n🏢 Empresa: {empresa.company_name} (ID: {empresa.id})")
        print(f"   Usuario: {empresa.user.email}")
        
        # Obtener proyectos de la empresa
        proyectos = Proyecto.objects.filter(company=empresa)
        print(f"   📋 Total de proyectos: {proyectos.count()}")
        
        for proyecto in proyectos:
            print(f"\n   📁 Proyecto: {proyecto.title} (ID: {proyecto.id})")
            print(f"      Estado: {proyecto.status.name if proyecto.status else 'Sin estado'}")
            print(f"      Estudiantes máximos: {proyecto.max_students}")
            print(f"      Estudiantes actuales: {proyecto.current_students}")
            
            # Obtener aplicaciones
            aplicaciones = Aplicacion.objects.filter(project=proyecto)
            print(f"      📝 Total de aplicaciones: {aplicaciones.count()}")
            
            # Aplicaciones por estado
            estados = ['pending', 'reviewing', 'interviewed', 'accepted', 'active', 'completed', 'rejected', 'withdrawn']
            for estado in estados:
                count = aplicaciones.filter(status=estado).count()
                if count > 0:
                    print(f"         - {estado}: {count}")
            
            # Obtener miembros del proyecto
            miembros = MiembroProyecto.objects.filter(proyecto=proyecto, rol='estudiante')
            print(f"      👥 Total de miembros: {miembros.count()}")
            
            # Miembros activos
            miembros_activos = miembros.filter(esta_activo=True)
            print(f"         - Activos: {miembros_activos.count()}")
            
            # Miembros inactivos
            miembros_inactivos = miembros.filter(esta_activo=False)
            print(f"         - Inactivos: {miembros_inactivos.count()}")
            
            # Detalles de aplicaciones aceptadas/activas/completadas
            aplicaciones_aceptadas = aplicaciones.filter(status__in=['accepted', 'active', 'completed'])
            if aplicaciones_aceptadas.exists():
                print(f"      ✅ Aplicaciones aceptadas/activas/completadas:")
                for app in aplicaciones_aceptadas:
                    estudiante = app.student
                    user = estudiante.user if estudiante else None
                    print(f"         - {user.full_name if user else 'Sin nombre'} ({user.email if user else 'Sin email'}) - Estado: {app.status}")
            
            # Detalles de miembros activos
            if miembros_activos.exists():
                print(f"      🔥 Miembros activos:")
                for miembro in miembros_activos:
                    user = miembro.usuario
                    print(f"         - {user.full_name} ({user.email}) - Rol: {miembro.rol}")

def debug_specific_project(project_id):
    """Debug de un proyecto específico"""
    try:
        proyecto = Proyecto.objects.get(id=project_id)
        print(f"\n🔍 DEBUG: Proyecto específico - {proyecto.title}")
        print("=" * 50)
        
        print(f"📁 Proyecto: {proyecto.title}")
        print(f"   ID: {proyecto.id}")
        print(f"   Estado: {proyecto.status.name if proyecto.status else 'Sin estado'}")
        print(f"   Empresa: {proyecto.company.company_name if proyecto.company else 'Sin empresa'}")
        
        # Aplicaciones
        aplicaciones = Aplicacion.objects.filter(project=proyecto)
        print(f"\n📝 Aplicaciones ({aplicaciones.count()} total):")
        
        for app in aplicaciones:
            estudiante = app.student
            user = estudiante.user if estudiante else None
            print(f"   - {user.full_name if user else 'Sin nombre'} ({user.email if user else 'Sin email'})")
            print(f"     Estado: {app.status}")
            print(f"     Fecha aplicación: {app.applied_at}")
            print(f"     Fecha respuesta: {app.responded_at}")
        
        # Miembros
        miembros = MiembroProyecto.objects.filter(proyecto=proyecto, rol='estudiante')
        print(f"\n👥 Miembros ({miembros.count()} total):")
        
        for miembro in miembros:
            user = miembro.usuario
            print(f"   - {user.full_name} ({user.email})")
            print(f"     Activo: {miembro.esta_activo}")
            print(f"     Rol: {miembro.rol}")
            print(f"     Fecha creación: {miembro.created_at}")
        
    except Proyecto.DoesNotExist:
        print(f"❌ Proyecto con ID {project_id} no encontrado")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Debug de proyecto específico
        project_id = sys.argv[1]
        debug_specific_project(project_id)
    else:
        # Debug general
        debug_projects() 