#!/usr/bin/env python3
"""
Script para corregir aplicaciones de proyectos ya completados:
Actualiza todas las aplicaciones de proyectos en estado 'completed' para que también estén en 'completed'.
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto
from applications.models import Aplicacion

# Buscar todos los proyectos completados
total_actualizados = 0
proyectos_completados = Proyecto.objects.filter(status__name__in=['completed', 'Completado'])

for proyecto in proyectos_completados:
    # Actualizar aplicaciones activas o aceptadas a 'completed'
    actualizados = Aplicacion.objects.filter(project=proyecto, status__in=['active', 'accepted']).update(status='completed')
    if actualizados > 0:
        print(f"Proyecto: {proyecto.title} - Aplicaciones actualizadas: {actualizados}")
        total_actualizados += actualizados

print(f"\nTotal de aplicaciones corregidas: {total_actualizados}") 