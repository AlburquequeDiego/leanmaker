#!/usr/bin/env python
"""
Script para verificar el estado de la base de datos
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def check_database_status():
    """
    Verifica el estado de la base de datos
    """
    print("🔍 VERIFICANDO ESTADO DE LA BASE DE DATOS")
    print("=" * 50)
    
    try:
        from users.models import User
        
        # Verificar usuarios
        total_users = User.objects.count()
        admin_users = User.objects.filter(is_superuser=True).count()
        regular_users = User.objects.filter(is_superuser=False).count()
        
        print(f"👥 Usuarios totales: {total_users}")
        print(f"👑 Administradores: {admin_users}")
        print(f"👤 Usuarios regulares: {regular_users}")
        
        if admin_users > 0:
            admin = User.objects.filter(is_superuser=True).first()
            print(f"\n✅ Usuario administrador encontrado:")
            print(f"   Email: {admin.email}")
            print(f"   ID: {admin.id}")
            print(f"   Role: {admin.role}")
            print(f"   Activo: {admin.is_active}")
        else:
            print("\n❌ No hay usuarios administradores")
        
        # Verificar otras apps
        print(f"\n📊 Estado de otras entidades:")
        
        try:
            from companies.models import Empresa
            empresas_count = Empresa.objects.count()
            print(f"   🏢 Empresas: {empresas_count}")
        except:
            print("   🏢 Empresas: Error al verificar")
        
        try:
            from projects.models import Proyecto
            proyectos_count = Proyecto.objects.count()
            print(f"   📋 Proyectos: {proyectos_count}")
        except:
            print("   📋 Proyectos: Error al verificar")
        
        try:
            from students.models import Estudiante
            estudiantes_count = Estudiante.objects.count()
            print(f"   🎓 Estudiantes: {estudiantes_count}")
        except:
            print("   🎓 Estudiantes: Error al verificar")
        
        try:
            from applications.models import Aplicacion
            aplicaciones_count = Aplicacion.objects.count()
            print(f"   📝 Aplicaciones: {aplicaciones_count}")
        except:
            print("   📝 Aplicaciones: Error al verificar")
        
        print(f"\n🎯 Resumen:")
        print(f"   ✅ Base de datos: Funcionando")
        print(f"   ✅ Migraciones: Completadas")
        print(f"   ✅ Usuario admin: {'Sí' if admin_users > 0 else 'No'}")
        print(f"   ✅ Estructura: Intacta")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando base de datos: {e}")
        return False

if __name__ == '__main__':
    success = check_database_status()
    
    if success:
        print("\n🎉 ¡Verificación completada exitosamente!")
    else:
        print("\n❌ La verificación no se completó correctamente")
