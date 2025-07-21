#!/usr/bin/env python3
"""
Script para crear niveles TRL en la base de datos
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from trl_levels.models import TRLLevel

def crear_niveles_trl():
    """Crear niveles TRL en la base de datos"""
    print("🚀 CREANDO NIVELES TRL")
    print("=" * 50)
    
    # Definir niveles TRL
    niveles_trl = [
        {
            'level': 1,
            'name': 'Principios básicos observados',
            'description': 'Principios básicos observados y reportados',
            'min_hours': 20
        },
        {
            'level': 2,
            'name': 'Concepto tecnológico formulado',
            'description': 'Concepto tecnológico y/o aplicación formulada',
            'min_hours': 20
        },
        {
            'level': 3,
            'name': 'Prueba de concepto analítica',
            'description': 'Prueba de concepto analítica y experimental',
            'min_hours': 40
        },
        {
            'level': 4,
            'name': 'Validación en laboratorio',
            'description': 'Validación de componente y/o sistema en ambiente de laboratorio',
            'min_hours': 40
        },
        {
            'level': 5,
            'name': 'Validación en ambiente relevante',
            'description': 'Validación de componente y/o sistema en ambiente relevante',
            'min_hours': 80
        },
        {
            'level': 6,
            'name': 'Demostración en ambiente relevante',
            'description': 'Demostración de sistema/subsistema en ambiente relevante',
            'min_hours': 80
        },
        {
            'level': 7,
            'name': 'Demostración en ambiente operacional',
            'description': 'Demostración de sistema en ambiente operacional',
            'min_hours': 160
        },
        {
            'level': 8,
            'name': 'Sistema completo calificado',
            'description': 'Sistema completo y calificado mediante prueba y demostración',
            'min_hours': 160
        },
        {
            'level': 9,
            'name': 'Sistema probado en ambiente real',
            'description': 'Sistema probado a través de operación exitosa en ambiente real',
            'min_hours': 160
        }
    ]
    
    try:
        # Crear niveles TRL
        for nivel in niveles_trl:
            trl, created = TRLLevel.objects.get_or_create(
                level=nivel['level'],
                defaults={
                    'name': nivel['name'],
                    'description': nivel['description'],
                    'min_hours': nivel['min_hours']
                }
            )
            
            if created:
                print(f"✅ Creado TRL {trl.level}: {trl.name}")
            else:
                print(f"📄 TRL {trl.level} ya existe: {trl.name}")
        
        # Verificar niveles creados
        print(f"\n📊 Total de niveles TRL: {TRLLevel.objects.count()}")
        
        # Mostrar todos los niveles
        print("\n📋 NIVELES TRL CREADOS:")
        print("-" * 40)
        for trl in TRLLevel.objects.all().order_by('level'):
            print(f"📄 TRL {trl.level} - {trl.name}")
            print(f"   📄 Horas mínimas: {trl.min_hours}")
            print(f"   📄 Descripción: {trl.description}")
            print()
        
        print("✅ NIVELES TRL CREADOS EXITOSAMENTE")
        
    except Exception as e:
        print(f"❌ Error creando niveles TRL: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    crear_niveles_trl() 