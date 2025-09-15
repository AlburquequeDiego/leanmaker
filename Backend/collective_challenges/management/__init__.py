"""
Comando de Django para poblar las áreas de desafíos colectivos
"""

from django.core.management.base import BaseCommand
from collective_challenges.models import ChallengeArea
from .commands.challenge_areas_data import CHALLENGE_AREAS_DATA


class Command(BaseCommand):
    help = 'Pobla la base de datos con las áreas de desafíos colectivos'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando población de áreas de desafíos...')
        
        created_count = 0
        updated_count = 0
        
        for area_data in CHALLENGE_AREAS_DATA:
            area, created = ChallengeArea.objects.get_or_create(
                name=area_data['name'],
                defaults={
                    'description': area_data['description'],
                    'color': area_data['color'],
                    'icon': area_data['icon'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✓ Creada área: {area.name}')
            else:
                # Actualizar datos existentes
                area.description = area_data['description']
                area.color = area_data['color']
                area.icon = area_data['icon']
                area.is_active = True
                area.save()
                updated_count += 1
                self.stdout.write(f'↻ Actualizada área: {area.name}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Completado: {created_count} áreas creadas, {updated_count} actualizadas'
            )
        )
