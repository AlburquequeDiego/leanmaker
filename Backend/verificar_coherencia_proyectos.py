#!/usr/bin/env python3
"""
Script para verificar y corregir la coherencia de proyectos según nivel TRL
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto
from trl_levels.models import TRLLevel

def verificar_coherencia_proyectos():
    """Verificar y corregir la coherencia de proyectos según nivel TRL"""
    print("🔍 VERIFICACIÓN DE COHERENCIA DE PROYECTOS")
    print("=" * 60)
    
    # Mapeo TRL a API Level y horas mínimas
    trl_to_api = {
        1: {'api_level': 1, 'min_hours': 20, 'max_hours': 40, 'description': 'Principios básicos'},
        2: {'api_level': 1, 'min_hours': 20, 'max_hours': 40, 'description': 'Concepto tecnológico'},
        3: {'api_level': 2, 'min_hours': 40, 'max_hours': 80, 'description': 'Prueba de concepto'},
        4: {'api_level': 2, 'min_hours': 40, 'max_hours': 80, 'description': 'Validación en laboratorio'},
        5: {'api_level': 3, 'min_hours': 80, 'max_hours': 160, 'description': 'Validación en ambiente relevante'},
        6: {'api_level': 3, 'min_hours': 80, 'max_hours': 160, 'description': 'Demostración en ambiente relevante'},
        7: {'api_level': 4, 'min_hours': 160, 'max_hours': 320, 'description': 'Demostración en ambiente operacional'},
        8: {'api_level': 4, 'min_hours': 160, 'max_hours': 320, 'description': 'Sistema completo calificado'},
        9: {'api_level': 4, 'min_hours': 160, 'max_hours': 320, 'description': 'Sistema probado en ambiente real'}
    }
    
    # Obtener todos los proyectos
    proyectos = Proyecto.objects.all()
    print(f"📊 Total de proyectos: {proyectos.count()}")
    
    proyectos_incoherentes = []
    proyectos_corregidos = 0
    
    for proyecto in proyectos:
        print(f"\n📋 PROYECTO: {proyecto.title}")
        print("-" * 40)
        
        # Verificar si tiene TRL
        if not proyecto.trl:
            print(f"❌ Sin nivel TRL asignado")
            proyectos_incoherentes.append({
                'proyecto': proyecto,
                'problema': 'Sin TRL asignado',
                'sugerencia': 'Asignar TRL 1-3 para proyectos básicos'
            })
            continue
        
        trl_level = proyecto.trl.level
        trl_info = trl_to_api.get(trl_level, {})
        
        print(f"📄 TRL: {trl_level} - {trl_info.get('description', 'N/A')}")
        print(f"📄 API Level actual: {proyecto.api_level}")
        print(f"📄 Horas requeridas actuales: {proyecto.required_hours}")
        
        # Verificar coherencia
        problemas = []
        
        # 1. Verificar API Level
        api_level_esperado = trl_info.get('api_level')
        if proyecto.api_level != api_level_esperado:
            problemas.append(f"API Level incorrecto: {proyecto.api_level} (debería ser {api_level_esperado})")
        
        # 2. Verificar horas requeridas
        min_hours = trl_info.get('min_hours', 20)
        max_hours = trl_info.get('max_hours', 320)
        
        if not proyecto.required_hours:
            problemas.append(f"Sin horas requeridas asignadas")
        elif proyecto.required_hours < min_hours:
            problemas.append(f"Horas insuficientes: {proyecto.required_hours} (mínimo {min_hours})")
        elif proyecto.required_hours > max_hours:
            problemas.append(f"Horas excesivas: {proyecto.required_hours} (máximo {max_hours})")
        
        # 3. Verificar duración semanal
        if proyecto.required_hours and proyecto.hours_per_week:
            semanas_estimadas = proyecto.required_hours / proyecto.hours_per_week
            if semanas_estimadas < 4:
                problemas.append(f"Duración muy corta: {semanas_estimadas:.1f} semanas")
            elif semanas_estimadas > 52:
                problemas.append(f"Duración muy larga: {semanas_estimadas:.1f} semanas")
        
        if problemas:
            print(f"❌ PROBLEMAS DETECTADOS:")
            for problema in problemas:
                print(f"   • {problema}")
            
            proyectos_incoherentes.append({
                'proyecto': proyecto,
                'problema': 'Incoherencia en configuración',
                'detalles': problemas
            })
            
            # Corregir automáticamente
            print(f"🔧 CORRIGIENDO...")
            
            # Corregir API Level
            if proyecto.api_level != api_level_esperado:
                proyecto.api_level = api_level_esperado
                print(f"   ✅ API Level corregido: {api_level_esperado}")
            
            # Corregir horas requeridas
            if not proyecto.required_hours or proyecto.required_hours < min_hours:
                proyecto.required_hours = min_hours
                print(f"   ✅ Horas requeridas corregidas: {min_hours}")
            
            # Corregir horas por semana si es necesario
            if proyecto.required_hours and proyecto.hours_per_week:
                semanas_estimadas = proyecto.required_hours / proyecto.hours_per_week
                if semanas_estimadas < 4:
                    proyecto.hours_per_week = min(proyecto.required_hours // 4, 40)
                    print(f"   ✅ Horas por semana corregidas: {proyecto.hours_per_week}")
                elif semanas_estimadas > 52:
                    proyecto.hours_per_week = max(proyecto.required_hours // 52, 5)
                    print(f"   ✅ Horas por semana corregidas: {proyecto.hours_per_week}")
            
            # Guardar cambios
            proyecto.save()
            proyectos_corregidos += 1
            print(f"   ✅ Proyecto corregido y guardado")
        else:
            print(f"✅ Proyecto coherente")
    
    # Resumen
    print(f"\n📊 RESUMEN")
    print("=" * 60)
    print(f"📄 Total de proyectos: {proyectos.count()}")
    print(f"📄 Proyectos incoherentes: {len(proyectos_incoherentes)}")
    print(f"📄 Proyectos corregidos: {proyectos_corregidos}")
    
    if proyectos_incoherentes:
        print(f"\n📋 PROYECTOS CON PROBLEMAS:")
        print("-" * 40)
        for item in proyectos_incoherentes:
            proyecto = item['proyecto']
            print(f"📄 {proyecto.title}")
            print(f"   • Problema: {item['problema']}")
            if 'detalles' in item:
                for detalle in item['detalles']:
                    print(f"   • {detalle}")
            print()
    
    print("✅ VERIFICACIÓN COMPLETADA")

if __name__ == "__main__":
    verificar_coherencia_proyectos() 