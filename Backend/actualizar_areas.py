import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from areas.models import Area

print('=== ACTUALIZANDO ÁREAS ===')

# Limpiar áreas existentes
print('--- Limpiando áreas existentes ---')
Area.objects.all().delete()
print('✅ Áreas anteriores eliminadas.')

# Crear las 10 áreas generales nuevas
print('--- Creando 10 áreas generales ---')
AREAS_GENERALES = [
    {"name": "Tecnología y Sistemas", "description": "Área de tecnología, informática y sistemas"},
    {"name": "Administración y Gestión", "description": "Área de administración, gestión empresarial y finanzas"},
    {"name": "Comunicación y Marketing", "description": "Área de comunicación, marketing y publicidad"},
    {"name": "Salud y Ciencias", "description": "Área de salud, medicina, biología y ciencias"},
    {"name": "Ingeniería y Construcción", "description": "Área de ingeniería, construcción y arquitectura"},
    {"name": "Educación y Formación", "description": "Área de educación, pedagogía y formación"},
    {"name": "Arte y Diseño", "description": "Área de arte, diseño gráfico y creatividad"},
    {"name": "Investigación y Desarrollo", "description": "Área de investigación, desarrollo e innovación"},
    {"name": "Servicios y Atención al Cliente", "description": "Área de servicios, atención al cliente y ventas"},
    {"name": "Sostenibilidad y Medio Ambiente", "description": "Área de sostenibilidad, medio ambiente y responsabilidad social"},
]

for i, area_data in enumerate(AREAS_GENERALES, 1):
    area = Area.objects.create(
        id=i,
        name=area_data["name"],
        description=area_data["description"]
    )
    print(f'✅ Área {i}: {area.name}')

print('\n=== RESUMEN ===')
print('✅ 10 áreas generales creadas exitosamente')
print('✅ Usuarios existentes mantenidos')
print('\n🎉 Áreas actualizadas! Ahora puedes:')
print('   - Filtrar proyectos por área en el frontend')
print('   - Crear proyectos con las nuevas áreas')
print('   - Los filtros de estudiantes funcionarán correctamente') 