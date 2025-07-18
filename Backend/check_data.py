#!/usr/bin/env python
"""
Script para verificar los datos de prueba creados
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
from notifications.models import Notification

def verificar_datos():
    print("=== Verificación de Datos de Prueba ===")
    
    # Contar registros
    print(f"Estudiantes: {Estudiante.objects.count()}")
    print(f"Empresas: {Empresa.objects.count()}")
    print(f"Proyectos: {Proyecto.objects.count()}")
    print(f"Aplicaciones: {AplicacionProyecto.objects.count()}")
    print(f"Horas trabajadas: {WorkHour.objects.count()}")
    print(f"Notificaciones: {Notification.objects.count()}")
    
    # Estudiantes con proyectos
    estudiantes_con_proyectos = Estudiante.objects.filter(completed_projects__gt=0)
    print(f"\nEstudiantes con experiencia en proyectos: {estudiantes_con_proyectos.count()}")
    
    for estudiante in estudiantes_con_proyectos:
        print(f"- {estudiante.user.full_name}")
        print(f"  API Level: {estudiante.api_level}")
        print(f"  Proyectos completados: {estudiante.completed_projects}")
        print(f"  Horas totales: {estudiante.total_hours}")
        print(f"  Habilidades: {estudiante.get_skills_list()}")
        print()
    
    # Proyectos con estudiantes
    print("Proyectos con estudiantes asignados:")
    for proyecto in Proyecto.objects.all():
        aplicaciones = AplicacionProyecto.objects.filter(proyecto=proyecto, estado='accepted')
        print(f"- {proyecto.title}")
        print(f"  Empresa: {proyecto.company.company_name if proyecto.company else 'Sin empresa'}")
        print(f"  Estudiantes: {aplicaciones.count()}")
        for aplicacion in aplicaciones:
            print(f"    * {aplicacion.estudiante.full_name}")
        print()

if __name__ == '__main__':
    verificar_datos() 