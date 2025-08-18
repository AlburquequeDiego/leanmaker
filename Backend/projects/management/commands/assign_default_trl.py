from django.core.management.base import BaseCommand
from django.db import transaction
from projects.models import Proyecto
from trl_levels.models import TRLLevel


class Command(BaseCommand):
    help = 'Asigna un nivel TRL por defecto (TRL 1) a todos los proyectos que no tienen TRL asignado'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Muestra qué proyectos se actualizarían sin hacer cambios reales',
        )
        parser.add_argument(
            '--default-trl',
            type=int,
            default=1,
            help='Nivel TRL por defecto a asignar (por defecto: 1)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        default_trl_level = options['default_trl']
        
        # Verificar que el nivel TRL por defecto existe
        try:
            default_trl = TRLLevel.objects.get(level=default_trl_level)
        except TRLLevel.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ Error: El nivel TRL {default_trl_level} no existe')
            )
            return

        # Obtener proyectos sin TRL
        projects_without_trl = Proyecto.objects.filter(trl__isnull=True)
        count = projects_without_trl.count()

        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('✅ Todos los proyectos ya tienen un nivel TRL asignado')
            )
            return

        self.stdout.write(
            f'📊 Encontrados {count} proyectos sin nivel TRL asignado'
        )
        self.stdout.write(f'🎯 Se asignará TRL {default_trl_level} ({default_trl.name}) por defecto')

        if dry_run:
            self.stdout.write('\n🔍 MODO DRY-RUN - No se harán cambios reales')
            self.stdout.write('Proyectos que se actualizarían:')
            for project in projects_without_trl[:10]:  # Mostrar solo los primeros 10
                self.stdout.write(f'  - {project.title} (ID: {project.id})')
            if count > 10:
                self.stdout.write(f'  ... y {count - 10} proyectos más')
            return

        # Confirmar la operación
        confirm = input(f'\n⚠️  ¿Estás seguro de que quieres asignar TRL {default_trl_level} a {count} proyectos? (yes/no): ')
        if confirm.lower() not in ['yes', 'y', 'si', 's']:
            self.stdout.write('❌ Operación cancelada')
            return

        # Ejecutar la actualización
        try:
            with transaction.atomic():
                updated_count = projects_without_trl.update(trl=default_trl)
                
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Se actualizaron {updated_count} proyectos exitosamente')
                )
                self.stdout.write(f'📈 Todos los proyectos ahora tienen TRL {default_trl_level} asignado')
                
                # Verificar que no quedan proyectos sin TRL
                remaining = Proyecto.objects.filter(trl__isnull=True).count()
                if remaining == 0:
                    self.stdout.write('🎉 ¡Perfecto! Todos los proyectos tienen TRL asignado')
                else:
                    self.stdout.write(f'⚠️  Aún quedan {remaining} proyectos sin TRL')

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error durante la actualización: {str(e)}')
            )
            return

        self.stdout.write('\n💡 Recomendación: Considera cambiar el modelo para hacer el campo TRL obligatorio')
        self.stdout.write('   Esto evitará que futuros proyectos se creen sin TRL asignado')
