import os
import django

def setup_django():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

setup_django()

from applications.models import Aplicacion
from projects.models import Proyecto, MiembroProyecto
from django.db import transaction


def corregir_participantes():
    print('Corrigiendo participantes de proyectos...')
    proyectos_actualizados = 0
    for proyecto in Proyecto.objects.all():
        # Buscar aplicaciones aceptadas para este proyecto
        aplicaciones_aceptadas = Aplicacion.objects.filter(project=proyecto, status='accepted')
        estudiantes_aceptados = [app.student for app in aplicaciones_aceptadas if app.student]
        miembros_creados = 0
        for estudiante in estudiantes_aceptados:
            if not MiembroProyecto.objects.filter(proyecto=proyecto, usuario=estudiante.user).exists():
                MiembroProyecto.objects.create(
                    proyecto=proyecto,
                    usuario=estudiante.user,
                    rol='estudiante'
                )
                miembros_creados += 1
        # Actualizar el contador current_students
        total_miembros = MiembroProyecto.objects.filter(proyecto=proyecto, rol='estudiante', esta_activo=True).count()
        if proyecto.current_students != total_miembros:
            proyecto.current_students = total_miembros
            proyecto.save(update_fields=['current_students'])
            proyectos_actualizados += 1
        print(f"Proyecto: {proyecto.title} - Miembros añadidos: {miembros_creados} - Total estudiantes: {total_miembros}")
    print(f"Proyectos actualizados: {proyectos_actualizados}")

if __name__ == '__main__':
    with transaction.atomic():
        corregir_participantes() 