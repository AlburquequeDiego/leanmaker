#!/usr/bin/env python3
"""
Script para crear los niveles TRL básicos en la base de datos
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from trl_levels.models import TRLLevel

def crear_niveles_trl():
    """Crea los niveles TRL básicos del sistema"""
    
    print("🔧 CREANDO NIVELES TRL")
    print("=" * 40)
    
    # Niveles TRL básicos
    niveles_trl = [
        {
            'level': 1,
            'name': 'TRL 1 - Principios básicos observados',
            'description': 'Fase de idea, sin definición clara ni desarrollo previo. Principios básicos observados y reportados.',
            'color': '#FF5722'
        },
        {
            'level': 2,
            'name': 'TRL 2 - Concepto tecnológico formulado',
            'description': 'Definición clara y antecedentes de lo que se desea desarrollar. Concepto tecnológico formulado.',
            'color': '#FF9800'
        },
        {
            'level': 3,
            'name': 'TRL 3 - Prueba de concepto analítica',
            'description': 'Pruebas y validaciones de concepto. Componentes evaluados por separado. Prueba de concepto analítica.',
            'color': '#FFC107'
        },
        {
            'level': 4,
            'name': 'TRL 4 - Validación en laboratorio',
            'description': 'Prototipo mínimo viable probado en condiciones controladas simples. Validación en laboratorio.',
            'color': '#8BC34A'
        },
        {
            'level': 5,
            'name': 'TRL 5 - Validación en ambiente relevante',
            'description': 'Prototipo mínimo viable probado en condiciones similares al entorno real. Validación en ambiente relevante.',
            'color': '#4CAF50'
        },
        {
            'level': 6,
            'name': 'TRL 6 - Demostración en ambiente relevante',
            'description': 'Prototipo probado mediante un piloto en condiciones reales. Demostración en ambiente relevante.',
            'color': '#2196F3'
        },
        {
            'level': 7,
            'name': 'TRL 7 - Demostración en ambiente operacional',
            'description': 'Desarrollo probado en condiciones reales, por un periodo prolongado. Demostración en ambiente operacional.',
            'color': '#3F51B5'
        },
        {
            'level': 8,
            'name': 'TRL 8 - Sistema completo calificado',
            'description': 'Producto validado en lo técnico y lo comercial. Sistema completo calificado.',
            'color': '#9C27B0'
        },
        {
            'level': 9,
            'name': 'TRL 9 - Sistema probado en ambiente real',
            'description': 'Producto completamente desarrollado y disponible para la sociedad. Sistema probado en ambiente real.',
            'color': '#E91E63'
        }
    ]
    
    creados = 0
    for trl_data in niveles_trl:
        # Verificar si ya existe
        if TRLLevel.objects.filter(level=trl_data['level']).exists():
            print(f"⚠️  El TRL {trl_data['level']} ya existe")
            continue
        
        # Crear el nivel TRL
        trl = TRLLevel.objects.create(
            level=trl_data['level'],
            name=trl_data['name'],
            description=trl_data['description'],
            min_hours=20 * trl_data['level'],  # Horas mínimas basadas en el nivel
            is_active=True
        )
        print(f"✅ Creado: {trl.name} (ID: {trl.id})")
        creados += 1
    
    print(f"\n📊 Resumen:")
    print(f"   - Niveles TRL creados: {creados}")
    print(f"   - Total de niveles TRL: {TRLLevel.objects.count()}")
    
    # Mostrar todos los niveles TRL disponibles
    print(f"\n📋 Niveles TRL disponibles:")
    for trl in TRLLevel.objects.all().order_by('level'):
        print(f"   ID: {trl.id} | Nivel: {trl.level} | Nombre: '{trl.name}'")

if __name__ == "__main__":
    crear_niveles_trl() 