from users.models import Usuario

def main():
    # Lista de todos los usuarios de prueba que deben tener contraseña Admin123!
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
    
    print("Cambiando contraseñas de usuarios de prueba...")
    print(f"Nueva contraseña: {nueva_contraseña}")
    print("-" * 50)
    
    for email in usuarios_prueba:
        try:
            user = Usuario.objects.get(email=email)
            user.set_password(nueva_contraseña)
            user.save()
            print(f"✓ Contraseña cambiada para: {email}")
        except Usuario.DoesNotExist:
            print(f"✗ Usuario no encontrado: {email}")
    
    print("-" * 50)
    print("¡Proceso completado!")
    print(f"Todos los usuarios de prueba ahora tienen la contraseña: {nueva_contraseña}")

if __name__ == "__main__":
    main() 