#!/usr/bin/env python
"""
Script para verificar que el sistema LeanMaker esté funcionando correctamente
"""
import os
import sys
import django
from django.utils import timezone

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'leanmaker_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import Usuario
from companies.models import Empresa
from students.models import Estudiante
from projects.models import Proyecto
from areas.models import Area
from trl_levels.models import TRLLevel

User = get_user_model()

def verify_system():
    print("🔍 Verificando sistema LeanMaker...")
    
    # Verificar usuarios
    print("\n1️⃣ Verificando usuarios...")
    admin_users = User.objects.filter(is_staff=True)
    student_users = User.objects.filter(role='student')
    company_users = User.objects.filter(role='company')
    
    print(f"   • Administradores: {admin_users.count()}")
    print(f"   • Estudiantes: {student_users.count()}")
    print(f"   • Empresas: {company_users.count()}")
    
    # Verificar estudiantes
    print("\n2️⃣ Verificando estudiantes...")
    estudiantes = Estudiante.objects.all()
    print(f"   • Total estudiantes: {estudiantes.count()}")
    
    for estudiante in estudiantes[:3]:  # Mostrar primeros 3
        print(f"   • {estudiante.user.full_name} - {estudiante.career} (Semestre {estudiante.semester})")
    
    # Verificar empresas
    print("\n3️⃣ Verificando empresas...")
    empresas = Empresa.objects.all()
    print(f"   • Total empresas: {empresas.count()}")
    
    for empresa in empresas:
        print(f"   • {empresa.company_name} - {empresa.industry} ({empresa.size})")
    
    # Verificar proyectos
    print("\n4️⃣ Verificando proyectos...")
    proyectos = Proyecto.objects.all()
    print(f"   • Total proyectos: {proyectos.count()}")
    
    for proyecto in proyectos:
        print(f"   • {proyecto.title} - {proyecto.company.company_name}")
        print(f"     Área: {proyecto.area.name if proyecto.area else 'Sin área'}")
        print(f"     TRL: {proyecto.trl.level if proyecto.trl else 'Sin TRL'}")
        print(f"     Estudiantes: {proyecto.current_students}/{proyecto.max_students}")
    
    # Verificar áreas
    print("\n5️⃣ Verificando áreas...")
    areas = Area.objects.all()
    print(f"   • Total áreas: {areas.count()}")
    
    for area in areas:
        project_count = area.proyectos.count()
        print(f"   • {area.name} - {project_count} proyectos")
    
    # Verificar niveles TRL
    print("\n6️⃣ Verificando niveles TRL...")
    trl_levels = TRLLevel.objects.all()
    print(f"   • Total niveles TRL: {trl_levels.count()}")
    
    for trl in trl_levels:
        project_count = trl.proyectos.count()
        print(f"   • TRL {trl.level}: {trl.name} - {project_count} proyectos")
    
    # Verificar relaciones
    print("\n7️⃣ Verificando relaciones...")
    
    # Verificar que los estudiantes tengan usuarios asociados
    estudiantes_sin_usuario = Estudiante.objects.filter(user__isnull=True)
    if estudiantes_sin_usuario.exists():
        print(f"   ⚠️  {estudiantes_sin_usuario.count()} estudiantes sin usuario asociado")
    else:
        print("   ✅ Todos los estudiantes tienen usuario asociado")
    
    # Verificar que los proyectos tengan empresa asociada
    proyectos_sin_empresa = Proyecto.objects.filter(company__isnull=True)
    if proyectos_sin_empresa.exists():
        print(f"   ⚠️  {proyectos_sin_empresa.count()} proyectos sin empresa asociada")
    else:
        print("   ✅ Todos los proyectos tienen empresa asociada")
    
    # Verificar que los proyectos tengan área asociada
    proyectos_sin_area = Proyecto.objects.filter(area__isnull=True)
    if proyectos_sin_area.exists():
        print(f"   ⚠️  {proyectos_sin_area.count()} proyectos sin área asociada")
    else:
        print("   ✅ Todos los proyectos tienen área asociada")
    
    print("\n🎉 Verificación completada!")
    print("\n📊 Estadísticas del sistema:")
    print(f"   • Usuarios totales: {User.objects.count()}")
    print(f"   • Estudiantes: {Estudiante.objects.count()}")
    print(f"   • Empresas: {Empresa.objects.count()}")
    print(f"   • Proyectos: {Proyecto.objects.count()}")
    print(f"   • Áreas: {Area.objects.count()}")
    print(f"   • Niveles TRL: {TRLLevel.objects.count()}")

if __name__ == '__main__':
    verify_system() 