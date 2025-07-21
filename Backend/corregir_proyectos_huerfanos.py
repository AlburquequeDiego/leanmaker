import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from companies.models import Empresa
from projects.models import Proyecto
from users.models import User
from calendar_events.models import CalendarEvent

print('--- PROYECTOS Y SU EMPRESA Y USUARIO DUEÑO ---')
for proyecto in Proyecto.objects.all():
    print(f'Proyecto: {proyecto.id} | Título: {proyecto.title}')
    empresa = proyecto.company
    if empresa:
        print(f'    Empresa: {empresa.id} | Nombre: {getattr(empresa, "company_name", "-")} | Usuario dueño: {empresa.user_id}')
        try:
            user = User.objects.get(id=empresa.user_id)
            print(f'        Usuario: {user.email} | ID: {user.id}')
        except User.DoesNotExist:
            print('        Usuario NO EXISTE')
    else:
        print('    Proyecto SIN empresa')

print('\n--- EVENTOS DE CALENDARIO Y SU PROYECTO Y EMPRESA ---')
for event in CalendarEvent.objects.all():
    print(f'Evento: {event.id} | Título: {event.title}')
    if event.project:
        empresa = event.project.company
        print(f'    Proyecto: {event.project.id} | Título: {event.project.title}')
        if empresa:
            print(f'        Empresa: {empresa.id} | Nombre: {getattr(empresa, "company_name", "-")} | Usuario dueño: {empresa.user_id}')
            try:
                user = User.objects.get(id=empresa.user_id)
                print(f'            Usuario: {user.email} | ID: {user.id}')
            except User.DoesNotExist:
                print('            Usuario NO EXISTE')
        else:
            print('        Proyecto SIN empresa')
    else:
        print('    Evento SIN proyecto') 