from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Usuario
from students.models import Estudiante
from companies.models import Empresa

User = get_user_model()

class Command(BaseCommand):
    help = 'Crear usuarios de prueba para las 10 universidades'

    def handle(self, *args, **options):
        self.stdout.write('Creando usuarios de prueba...')
        
        # Universidades chilenas
        universidades = [
            {
                'nombre': 'Universidad de Chile',
                'dominio': 'uchile.cl',
                'abreviacion': 'UCH'
            },
            {
                'nombre': 'Pontificia Universidad Católica de Chile',
                'dominio': 'uc.cl',
                'abreviacion': 'PUC'
            },
            {
                'nombre': 'Universidad de Concepción',
                'dominio': 'udec.cl',
                'abreviacion': 'UDEC'
            },
            {
                'nombre': 'Universidad Técnica Federico Santa María',
                'dominio': 'usm.cl',
                'abreviacion': 'USM'
            },
            {
                'nombre': 'Universidad de Santiago de Chile',
                'dominio': 'usach.cl',
                'abreviacion': 'USACH'
            },
            {
                'nombre': 'Universidad Austral de Chile',
                'dominio': 'uach.cl',
                'abreviacion': 'UACH'
            },
            {
                'nombre': 'Universidad de Valparaíso',
                'dominio': 'uv.cl',
                'abreviacion': 'UV'
            },
            {
                'nombre': 'Universidad de La Frontera',
                'dominio': 'ufro.cl',
                'abreviacion': 'UFRO'
            },
            {
                'nombre': 'Universidad de Talca',
                'dominio': 'utalca.cl',
                'abreviacion': 'UTALCA'
            },
            {
                'nombre': 'Universidad de Antofagasta',
                'dominio': 'uantof.cl',
                'abreviacion': 'UANTOF'
            }
        ]

        # Crear usuarios de prueba para cada universidad
        for i, universidad in enumerate(universidades):
            # Crear estudiante
            email_estudiante = f'estudiante{i+1}@{universidad["dominio"]}'
            if not Usuario.objects.filter(email=email_estudiante).exists():
                estudiante_user = Usuario.objects.create_user(
                    email=email_estudiante,
                    password='test123456',
                    first_name=f'Estudiante{i+1}',
                    last_name=f'Apellido{i+1}',
                    role='student',
                    is_verified=True,
                    is_active=True
                )
                
                # Crear perfil de estudiante
                Estudiante.objects.create(
                    user=estudiante_user,
                    career='Ingeniería Civil Informática',
                    semester=6,
                    strikes=0
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'Estudiante creado: {email_estudiante}')
                )

            # Crear empresa
            email_empresa = f'empresa{i+1}@{universidad["dominio"]}'
            if not Usuario.objects.filter(email=email_empresa).exists():
                empresa_user = Usuario.objects.create_user(
                    email=email_empresa,
                    password='test123456',
                    first_name=f'Empresa{i+1}',
                    last_name=f'Corporación{i+1}',
                    role='company',
                    is_verified=True,
                    is_active=True
                )
                
                # Crear perfil de empresa
                Empresa.objects.create(
                    user=empresa_user,
                    company_name=f'Empresa {universidad["abreviacion"]}',
                    description=f'Empresa de tecnología asociada a {universidad["nombre"]}',
                    industry='Tecnología',
                    size='Mediana',
                    website=f'https://www.empresa{universidad["abreviacion"].lower()}.cl'
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'Empresa creada: {email_empresa}')
                )

        # Crear usuario administrador
        admin_email = 'admin@leanmaker.cl'
        if not Usuario.objects.filter(email=admin_email).exists():
            admin_user = Usuario.objects.create_superuser(
                email=admin_email,
                password='admin123456',
                first_name='Administrador',
                last_name='Sistema',
                role='admin'
            )
            self.stdout.write(
                self.style.SUCCESS(f'Administrador creado: {admin_email}')
            )

        self.stdout.write(
            self.style.SUCCESS('¡Usuarios de prueba creados exitosamente!')
        )
        self.stdout.write('\nCredenciales de prueba:')
        self.stdout.write('Estudiantes: estudiante1@uchile.cl - estudiante10@uantof.cl')
        self.stdout.write('Empresas: empresa1@uchile.cl - empresa10@uantof.cl')
        self.stdout.write('Admin: admin@leanmaker.cl')
        self.stdout.write('Contraseña para todos: test123456') 