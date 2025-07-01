from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

class Command(BaseCommand):
    help = 'Actualiza las contraseñas de todos los usuarios existentes'

    def handle(self, *args, **options):
        # Nueva contraseña que cumple los requisitos
        new_password = "Student123!"
        
        # Obtener todos los usuarios
        users = User.objects.all()
        
        self.stdout.write(f"Actualizando contraseñas para {users.count()} usuarios...")
        
        for user in users:
            # Actualizar contraseña
            user.password = make_password(new_password)
            user.save()
            self.stdout.write(f"✓ Contraseña actualizada para {user.email}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'¡Listo! Se actualizaron las contraseñas de {users.count()} usuarios.\n'
                f'Nueva contraseña para todos: {new_password}'
            )
        ) 