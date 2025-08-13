#!/usr/bin/env python3
"""
Script para probar la validación de RUTs chilenos
"""

from core.utils import validate_chilean_rut

def test_rut_validation():
    """Prueba varios RUTs para verificar la validación"""
    
    # RUTs válidos
    valid_ruts = [
        "12345678-9",
        "12.345.678-9",
        "123456789",
        "20.123.456-7",
        "201234567",
        "76.123.456-7",
        "761234567"
    ]
    
    # RUTs inválidos
    invalid_ruts = [
        "10-6",           # Muy corto
        "1234567-8",      # Solo 7 dígitos
        "1234567890-1",   # Muy largo
        "12345678-X",     # Dígito verificador inválido
        "12345678-0",     # Dígito verificador incorrecto
        "01234567-8",     # Empieza con 0
        "1000000-1",      # Muy pequeño
        "10000000-1",     # Formato sospechoso
        "abc12345-6",     # Contiene letras
        "12.345.67-8",    # Formato incorrecto
    ]
    
    print("🧪 Probando validación de RUTs chilenos")
    print("=" * 50)
    
    print("\n✅ RUTs VÁLIDOS:")
    for rut in valid_ruts:
        result = validate_chilean_rut(rut)
        status = "✅ VÁLIDO" if result['is_valid'] else "❌ INVÁLIDO"
        print(f"  {rut:<15} -> {status}")
        if result['is_valid']:
            print(f"           Formateado: {result['formatted_rut']}")
        else:
            print(f"           Error: {result['error']}")
    
    print("\n❌ RUTs INVÁLIDOS:")
    for rut in invalid_ruts:
        result = validate_chilean_rut(rut)
        status = "✅ VÁLIDO" if result['is_valid'] else "❌ INVÁLIDO"
        print(f"  {rut:<15} -> {status}")
        if not result['is_valid']:
            print(f"           Error: {result['error']}")
        else:
            print(f"           ⚠️  Debería ser inválido!")
    
    print("\n🔍 CASOS ESPECIALES:")
    
    # Caso del profesor (10-6)
    profesor_rut = "10-6"
    result = validate_chilean_rut(profesor_rut)
    print(f"  RUT del profesor '{profesor_rut}':")
    print(f"    Válido: {result['is_valid']}")
    if not result['is_valid']:
        print(f"    Error: {result['error']}")
    
    # RUTs reales de empresas chilenas
    empresas_reales = [
        "96.571.360-9",  # Ejemplo real
        "90.635.000-3",  # Ejemplo real
        "76.123.456-7",  # Ejemplo real
    ]
    
    print(f"\n🏢 RUTs de empresas reales:")
    for rut in empresas_reales:
        result = validate_chilean_rut(rut)
        status = "✅ VÁLIDO" if result['is_valid'] else "❌ INVÁLIDO"
        print(f"  {rut:<15} -> {status}")
        if result['is_valid']:
            print(f"           Formateado: {result['formatted_rut']}")

if __name__ == "__main__":
    test_rut_validation()
