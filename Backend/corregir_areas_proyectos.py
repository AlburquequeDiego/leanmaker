from projects.models import Proyecto
from areas.models import Area

def main():
    area_default = Area.objects.first()  # Puedes cambiar esto por el área que prefieras
    if not area_default:
        print('No hay áreas registradas en la base de datos.')
        return
    proyectos = Proyecto.objects.filter(area__isnull=True)
    count = 0
    for p in proyectos:
        p.area = area_default
        p.save()
        print(f'Proyecto {p.title} corregido con área {area_default.name}')
        count += 1
    print(f'Total corregidos: {count}')

main() 