#!/usr/bin/env python
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from companies.models import Empresa

def check_model():
    """Verifica el modelo Empresa directamente"""
    
    print("🔍 VERIFICANDO MODELO EMPRESA")
    print("=" * 50)
    
    empresas = Empresa.objects.all()
    
    for empresa in empresas:
        print(f"\n🏢 EMPRESA: {empresa.company_name}")
        print(f"   - ID: {empresa.id}")
        print(f"   - Rating: {empresa.rating}")
        print(f"   - Tipo de rating: {type(empresa.rating)}")
        
        # Verificar si el rating es None o 0
        if empresa.rating is None:
            print(f"   - ⚠️  Rating es None")
        elif empresa.rating == 0:
            print(f"   - ⚠️  Rating es 0")
        else:
            print(f"   - ✅ Rating tiene valor: {empresa.rating}")
        
        # Verificar si el campo existe en el modelo
        if hasattr(empresa, 'rating'):
            print(f"   - ✅ Campo rating existe en el modelo")
        else:
            print(f"   - ❌ Campo rating NO existe en el modelo")
        
        # Verificar si se puede acceder al campo
        try:
            rating_value = getattr(empresa, 'rating', None)
            print(f"   - ✅ Se puede acceder al campo rating: {rating_value}")
        except Exception as e:
            print(f"   - ❌ Error accediendo al campo rating: {e}")

if __name__ == "__main__":
    check_model()
