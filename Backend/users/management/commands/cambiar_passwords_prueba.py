from django.core.management.base import BaseCommand
from users.models import Usuario

class Command(BaseCommand):
    help = 'Cambia la contraseña de todos los usuarios de prueba a Admin123!'

    def handle(self, *args, **options):
        usuarios_prueba = [
            # Estudiantes
            "estudiante1@uchile.cl",
            "estudiante2@uc.cl", 
            "estudiante3@udec.cl",
            "estudiante4@usm.cl",
            "estudiante5@usach.cl",
            "estudiante6@uach.cl",
            "estudiante7@uv.cl",
            "estudiante8@ufro.cl",
            "estudiante9@utalca.cl",
            "estudiante10@uantof.cl",
            # Empresas
            "empresa1@uchile.cl",
            "empresa2@uc.cl",
            "empresa3@udec.cl", 
            "empresa4@usm.cl",
            "empresa5@usach.cl",
            "empresa6@uach.cl",
            "empresa7@uv.cl",
            "empresa8@ufro.cl",
            "empresa9@utalca.cl",
            "empresa10@uantof.cl",
            # Administrador
            "admin@leanmaker.cl"
        ]
        nueva_contraseña = "Admin123!"
        self.stdout.write(self.style.WARNING(f"Cambiando contraseñas de usuarios de prueba a: {nueva_contraseña}"))
        for email in usuarios_prueba:
            try:
                user = Usuario.objects.get(email=email)
                user.set_password(nueva_contraseña)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"✓ Contraseña cambiada para: {email}"))
            except Usuario.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"✗ Usuario no encontrado: {email}"))
        self.stdout.write(self.style.SUCCESS("¡Proceso completado!"))
        self.stdout.write(self.style.SUCCESS(f"Todos los usuarios de prueba ahora tienen la contraseña: {nueva_contraseña}")) 