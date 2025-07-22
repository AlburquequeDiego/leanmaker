import os
import django

def setup_django():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

setup_django()

from project_status.models import ProjectStatus
from projects.models import Proyecto
from django.db import transaction

# Mapeo de nombres en español a inglés
NOMBRES_UNIFICADOS = {
    'Publicado': 'published',
    'Activo': 'active',
    'Completado': 'completed',
    'Eliminado': 'deleted',
    'Cancelado': 'cancelled',
}

# Nombres válidos finales en inglés
NOMBRES_VALIDOS = ['published', 'active', 'completed', 'deleted', 'cancelled']

def revertir_estados():
    print('Revirtiendo nombres de estados de proyectos a inglés...')
    cambios = 0
    # 1. Reasignar proyectos de estados en español a los equivalentes en inglés
    for esp, eng in NOMBRES_UNIFICADOS.items():
        try:
            estado_esp = ProjectStatus.objects.get(name=esp)
            estado_eng = ProjectStatus.objects.filter(name=eng).first()
            if estado_eng:
                print(f"Reasignando proyectos de '{esp}' a '{eng}'")
                Proyecto.objects.filter(status=estado_esp).update(status=estado_eng)
                estado_esp.delete()
                cambios += 1
            else:
                # Si no existe el estado en inglés, renombrar el español
                print(f"Renombrando estado '{esp}' a '{eng}'")
                estado_esp.name = eng
                estado_esp.save(update_fields=['name'])
                cambios += 1
        except ProjectStatus.DoesNotExist:
            continue
    # 2. Eliminar duplicados y dejar solo uno por nombre válido
    for nombre in NOMBRES_VALIDOS:
        estados = ProjectStatus.objects.filter(name=nombre)
        if estados.count() > 1:
            # Dejar solo el primero, reasignar proyectos de los demás
            principal = estados.first()
            for duplicado in estados[1:]:
                print(f"Reasignando proyectos de estado duplicado '{nombre}' (ID {duplicado.id}) al principal (ID {principal.id})")
                Proyecto.objects.filter(status=duplicado).update(status=principal)
                duplicado.delete()
    print(f"Estados revertidos a inglés. Cambios realizados: {cambios}")

if __name__ == '__main__':
    with transaction.atomic():
        revertir_estados() 