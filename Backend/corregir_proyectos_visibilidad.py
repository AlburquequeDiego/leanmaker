#!/usr/bin/env python3
"""
Script para corregir todos los proyectos: asignar estado 'Publicado', TRL 1 y API 1 si faltan, para que sean visibles a estudiantes API 4.
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto
from project_status.models import ProjectStatus
from trl_levels.models import TRLLevel
from companies.models import Empresa

estado_publicado = ProjectStatus.objects.filter(name__in=['Publicado', 'published']).first()
trl_1 = TRLLevel.objects.filter(level=1).first()

print("\n🔧 Corrigiendo proyectos para visibilidad máxima...")
corregidos = 0
for p in Proyecto.objects.all():
    cambios = False
    if not p.status or p.status.name not in ['Publicado', 'published', 'Activo', 'active']:
        p.status = estado_publicado
        cambios = True
    if not p.trl:
        p.trl = trl_1
        cambios = True
    if not p.api_level:
        p.api_level = 1
        cambios = True
    if cambios:
        p.save()
        corregidos += 1
        print(f"✅ Corregido: {p.title}")
    else:
        print(f"✔️ Ya estaba bien: {p.title}")
print(f"\nTotal corregidos: {corregidos}")

empresa_dummy = Empresa.objects.first()  # Usar la primera empresa existente

proyectos_sin_empresa = Proyecto.objects.filter(company__isnull=True)
for proyecto in proyectos_sin_empresa:
    proyecto.company = empresa_dummy
    proyecto.save()
print(f"Corregidos {proyectos_sin_empresa.count()} proyectos sin empresa.") 