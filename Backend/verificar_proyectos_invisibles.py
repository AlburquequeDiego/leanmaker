#!/usr/bin/env python3
"""
Script para listar proyectos invisibles para un estudiante con API 4 y mostrar el motivo.
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto
from project_status.models import ProjectStatus

# Parámetros del estudiante
API_ESTUDIANTE = 4
TRL_MAX_ESTUDIANTE = 9  # API 4 permite TRL 1-9

estados_visibles = ProjectStatus.objects.filter(name__in=['Publicado', 'Activo', 'published', 'active'])
ids_estados_visibles = list(estados_visibles.values_list('id', flat=True))

proyectos = Proyecto.objects.all()

print(f"\n🔍 PROYECTOS INVISIBLES PARA ESTUDIANTE API 4 (TRL 1-9)")
print("=" * 60)

invisibles = 0
for p in proyectos:
    motivos = []
    if not p.status or p.status.id not in ids_estados_visibles:
        motivos.append(f"Estado: {p.status.name if p.status else 'Sin estado'}")
    if not p.trl or not p.trl.level:
        motivos.append("Sin TRL asignado")
    elif p.trl.level > TRL_MAX_ESTUDIANTE:
        motivos.append(f"TRL demasiado alto: {p.trl.level}")
    if not p.api_level:
        motivos.append("Sin API Level asignado")
    elif p.api_level > API_ESTUDIANTE:
        motivos.append(f"API Level demasiado alto: {p.api_level}")
    if motivos:
        invisibles += 1
        print(f"\n❌ {p.title}")
        for m in motivos:
            print(f"   • {m}")
    else:
        print(f"✅ {p.title} (VISIBLE)")

print(f"\nTotal de proyectos: {proyectos.count()}")
print(f"Proyectos invisibles para estudiante API 4: {invisibles}")
print(f"Proyectos visibles: {proyectos.count() - invisibles}") 