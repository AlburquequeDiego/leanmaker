#!/usr/bin/env python3
"""
Script para probar la creación de proyectos y identificar errores
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto
from companies.models import Empresa
from project_status.models import ProjectStatus
from areas.models import Area
from trl_levels.models import TRLLevel

def test_crear_proyecto():
    """Prueba crear un proyecto con datos mínimos"""
    
    print("🧪 PROBANDO CREACIÓN DE PROYECTO")
    print("=" * 50)
    
    try:
        # 1. Verificar que tenemos los datos necesarios
        print("📋 Verificando datos necesarios...")
        
        # Empresa
        empresa = Empresa.objects.first()
        if not empresa:
            print("❌ No hay empresas en la base de datos")
            return
        print(f"✅ Empresa encontrada: {empresa.company_name}")
        
        # Estado
        estado = ProjectStatus.objects.filter(name='published').first()
        if not estado:
            print("❌ No hay estado 'published' en la base de datos")
            return
        print(f"✅ Estado encontrado: {estado.name} (ID: {estado.id})")
        
        # Área
        area = Area.objects.first()
        if not area:
            print("❌ No hay áreas en la base de datos")
            return
        print(f"✅ Área encontrada: {area.name} (ID: {area.id})")
        
        # TRL
        trl = TRLLevel.objects.first()
        if not trl:
            print("❌ No hay niveles TRL en la base de datos")
            return
        print(f"✅ TRL encontrado: {trl.name} (ID: {trl.id})")
        
        print()
        
        # 2. Intentar crear proyecto con datos mínimos
        print("🔧 Creando proyecto con datos mínimos...")
        
        proyecto = Proyecto.objects.create(
            title="Proyecto de Prueba",
            description="Descripción de prueba",
            requirements="Requisitos de prueba",
            company=empresa,
            status=estado,
            area=area,
            trl=trl,
            api_level=1,
            min_api_level=1,
            max_students=1,
            current_students=0,
            duration_weeks=12,
            hours_per_week=10,
            required_hours=40,
            modality='remote',
            difficulty='intermediate'
        )
        
        print(f"✅ Proyecto creado exitosamente!")
        print(f"   ID: {proyecto.id}")
        print(f"   Título: {proyecto.title}")
        print(f"   Estado: {proyecto.status.name}")
        print(f"   API Level: {proyecto.api_level}")
        print(f"   Min API Level: {proyecto.min_api_level}")
        
        # 3. Probar con diferentes niveles de API
        print("\n🔧 Probando con diferentes niveles de API...")
        
        for api_level in [1, 2, 3, 4]:
            proyecto_api = Proyecto.objects.create(
                title=f"Proyecto API {api_level}",
                description=f"Proyecto para estudiantes API {api_level}",
                requirements=f"Requisitos para API {api_level}",
                company=empresa,
                status=estado,
                area=area,
                trl=trl,
                api_level=api_level,
                min_api_level=api_level,
                max_students=1,
                current_students=0,
                duration_weeks=12,
                hours_per_week=10,
                required_hours=40,
                modality='remote',
                difficulty='intermediate'
            )
            print(f"✅ Proyecto API {api_level} creado: {proyecto_api.title}")
        
        print(f"\n🎉 ¡Todos los proyectos se crearon exitosamente!")
        print(f"   Total de proyectos creados: {Proyecto.objects.count()}")
        
    except Exception as e:
        print(f"❌ Error al crear proyecto: {str(e)}")
        print(f"   Tipo de error: {type(e).__name__}")
        
        # Mostrar más detalles del error
        import traceback
        print("\n📋 Detalles completos del error:")
        traceback.print_exc()

if __name__ == "__main__":
    test_crear_proyecto() 