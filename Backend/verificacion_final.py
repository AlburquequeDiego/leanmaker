import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from students.models import Estudiante
from companies.models import Empresa
from areas.models import Area

print('=== VERIFICACIÓN FINAL DEL SISTEMA ===')

# Contar entidades
usuarios = User.objects.count()
estudiantes = Estudiante.objects.count()
empresas = Empresa.objects.count()
areas = Area.objects.count()

print(f'📊 Usuarios totales: {usuarios}')
print(f'👨‍🎓 Estudiantes: {estudiantes}')
print(f'🏢 Empresas: {empresas}')
print(f'📂 Áreas: {areas}')

# Mostrar usuarios disponibles
print('\n👥 USUARIOS DISPONIBLES:')
for user in User.objects.all():
    print(f'   - {user.email} ({user.role})')

# Mostrar áreas disponibles
print('\n📂 ÁREAS DISPONIBLES:')
for area in Area.objects.all():
    print(f'   - {area.name}')

print('\n🎉 ¡SISTEMA LISTO PARA PRUEBAS!')
print('\n📝 CREDENCIALES:')
print('   - Admin: admin1@leanmaker.com / Admin123!')
print('   - Empresa: contacto@finanplus.com / Empresa123!')
print('   - Estudiante: juan.perez@uchile.cl / Estudiante123!') 