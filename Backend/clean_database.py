#!/usr/bin/env python
"""
Script para limpiar completamente la base de datos
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'leanmaker_backend.settings')
django.setup()

from django.db import connection
from users.models import Usuario
from students.models import Estudiante
from companies.models import Empresa
from projects.models import Proyecto
from areas.models import Area
from trl_levels.models import TRLLevel

def clean_database():
    print("🧹 Limpiando base de datos...")
    
    # Eliminar todos los datos en orden correcto (respetando foreign keys)
    print("   🗑️  Eliminando proyectos...")
    Proyecto.objects.all().delete()
    
    print("   🗑️  Eliminando estudiantes...")
    Estudiante.objects.all().delete()
    
    print("   🗑️  Eliminando empresas...")
    Empresa.objects.all().delete()
    
    print("   🗑️  Eliminando usuarios...")
    Usuario.objects.all().delete()
    
    print("   🗑️  Eliminando áreas...")
    Area.objects.all().delete()
    
    print("   🗑️  Eliminando niveles TRL...")
    TRLLevel.objects.all().delete()
    
    print("✅ Base de datos limpiada completamente!")

if __name__ == '__main__':
    clean_database() 