#!/usr/bin/env python
"""
Script de emergencia para proteger los niveles de API de todos los estudiantes.
Este script marca como aprobado por admin a todos los estudiantes que tienen
nivel de API mayor a 1 para evitar que se reseteen automáticamente.
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Estudiante

def proteger_niveles_api():
    """Protege los niveles de API de todos los estudiantes"""
    print("🛡️ Iniciando protección de niveles de API...")
    
    # Obtener todos los estudiantes con nivel de API mayor a 1
    estudiantes_proteger = Estudiante.objects.filter(api_level__gt=1)
    
    print(f"📊 Encontrados {estudiantes_proteger.count()} estudiantes con nivel de API > 1")
    
    protegidos = 0
    for estudiante in estudiantes_proteger:
        try:
            # Marcar como aprobado por admin
            estudiante.api_level_approved_by_admin = True
            estudiante.save(update_fields=['api_level_approved_by_admin'])
            
            print(f"✅ Protegido: {estudiante.user.email} - API {estudiante.api_level}")
            protegidos += 1
            
        except Exception as e:
            print(f"❌ Error protegiendo {estudiante.user.email}: {e}")
    
    print(f"\n🎯 Resumen:")
    print(f"   - Estudiantes encontrados: {estudiantes_proteger.count()}")
    print(f"   - Estudiantes protegidos: {protegidos}")
    print(f"   - Errores: {estudiantes_proteger.count() - protegidos}")
    
    if protegidos > 0:
        print(f"\n🛡️ Todos los estudiantes con nivel de API > 1 han sido protegidos")
        print(f"   Sus niveles NO se resetearán automáticamente")
    else:
        print(f"\n⚠️ No se pudo proteger ningún estudiante")

def verificar_proteccion():
    """Verifica que los niveles estén protegidos"""
    print("\n🔍 Verificando protección de niveles de API...")
    
    estudiantes_protegidos = Estudiante.objects.filter(
        api_level__gt=1,
        api_level_approved_by_admin=True
    )
    
    estudiantes_no_protegidos = Estudiante.objects.filter(
        api_level__gt=1,
        api_level_approved_by_admin=False
    )
    
    print(f"📊 Estado de protección:")
    print(f"   - Estudiantes protegidos: {estudiantes_protegidos.count()}")
    print(f"   - Estudiantes NO protegidos: {estudiantes_no_protegidos.count()}")
    
    if estudiantes_no_protegidos.count() > 0:
        print(f"\n⚠️ ATENCIÓN: Hay {estudiantes_no_protegidos.count()} estudiantes sin proteger:")
        for estudiante in estudiantes_no_protegidos:
            print(f"   - {estudiante.user.email} (API {estudiante.api_level})")
    else:
        print(f"\n✅ Todos los estudiantes con nivel de API > 1 están protegidos")

if __name__ == "__main__":
    print("🚨 SCRIPT DE EMERGENCIA - PROTECCIÓN DE NIVELES API")
    print("=" * 60)
    
    try:
        proteger_niveles_api()
        verificar_proteccion()
        
        print("\n🎉 Script ejecutado exitosamente")
        
    except Exception as e:
        print(f"\n❌ Error ejecutando el script: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
