#!/usr/bin/env python
"""
Script para verificar estados de proyecto
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from project_status.models import ProjectStatus
from projects.models import Proyecto

print("🔍 VERIFICANDO ESTADOS DE PROYECTO")
print("=" * 50)

# Estados definidos en el modelo
print("📊 Estados en ProjectStatus:")
statuses = ProjectStatus.objects.all()
for status in statuses:
    print(f"  - ID: {status.id}, Nombre: '{status.name}'")

print()

# Estados usados en proyectos
print("📋 Estados usados en proyectos:")
proyectos = Proyecto.objects.all()
for proyecto in proyectos:
    status_name = proyecto.status.name if proyecto.status else "Sin estado"
    print(f"  - {proyecto.title}: '{status_name}'")

print()

# Contar por estado
print("📈 Conteo por estado:")
for status in statuses:
    count = Proyecto.objects.filter(status=status).count()
    print(f"  - '{status.name}': {count} proyectos") 