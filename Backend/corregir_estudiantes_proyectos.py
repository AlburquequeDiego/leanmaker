#!/usr/bin/env python3
"""
Script para corregir el contador de estudiantes aceptados en cada proyecto.
Recalcula y actualiza el campo current_students según los miembros activos con rol 'estudiante'.
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Proyecto, MiembroProyecto

actualizados = 0
for proyecto in Proyecto.objects.all():
    count = MiembroProyecto.objects.filter(proyecto=proyecto, rol='estudiante', esta_activo=True).count()
    if proyecto.current_students != count:
        proyecto.current_students = count
        proyecto.save(update_fields=['current_students'])
        print(f"{proyecto.title}: contador actualizado a {count}")
        actualizados += 1
    else:
        print(f"{proyecto.title}: contador ya correcto ({count})")

print(f"\nTotal de proyectos corregidos: {actualizados}") 