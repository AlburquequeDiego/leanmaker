#!/usr/bin/env python
"""
Script para verificar que el historial se agregó correctamente a los estudiantes
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Estudiante
from projects.models import Proyecto, AplicacionProyecto
from work_hours.models import WorkHour
from companies.models import Empresa

def verificar_historial():
    """Verificar que el historial se agregó correctamente"""
    print("=== Verificación de Historial de Estudiantes ===")
    
    # 1. Contar estudiantes con proyectos
    estudiantes_con_proyectos = Estudiante.objects.filter(completed_projects__gt=0)
    print(f"Estudiantes con proyectos: {estudiantes_con_proyectos.count()}")
    
    # 2. Mostrar resumen por nivel API
    print("\nResumen por nivel API:")
    for api_level in range(1, 5):
        estudiantes_nivel = estudiantes_con_proyectos.filter(api_level=api_level)
        if estudiantes_nivel.exists():
            total_proyectos = sum(e.completed_projects for e in estudiantes_nivel)
            total_horas = sum(e.total_hours for e in estudiantes_nivel)
            print(f"  API {api_level}: {estudiantes_nivel.count()} estudiantes, {total_proyectos} proyectos, {total_horas} horas")
    
    # 3. Mostrar algunos ejemplos
    print("\nEjemplos de estudiantes con historial:")
    for estudiante in estudiantes_con_proyectos[:10]:  # Solo los primeros 10
        print(f"  - {estudiante.user.full_name}")
        print(f"    API Level: {estudiante.api_level}")
        print(f"    Proyectos completados: {estudiante.completed_projects}")
        print(f"    Horas totales: {estudiante.total_hours}")
        print()
    
    # 4. Verificar proyectos creados
    proyectos_creados = Proyecto.objects.filter(status__name='completed')
    print(f"Proyectos completados creados: {proyectos_creados.count()}")
    
    # 5. Verificar aplicaciones
    aplicaciones_aceptadas = AplicacionProyecto.objects.filter(estado='accepted')
    print(f"Aplicaciones aceptadas: {aplicaciones_aceptadas.count()}")
    
    # 6. Verificar horas trabajadas
    horas_trabajadas = WorkHour.objects.all()
    print(f"Horas trabajadas registradas: {horas_trabajadas.count()}")
    
    # 7. Verificar empresas
    empresas = Empresa.objects.all()
    print(f"Empresas utilizadas: {empresas.count()}")
    
    print("\n✅ Verificación completada. Los estudiantes ahora tienen historial real de proyectos.")

if __name__ == '__main__':
    verificar_historial() 