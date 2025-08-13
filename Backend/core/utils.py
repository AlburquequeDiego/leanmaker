"""
Utilidades para validación de RUT chileno
Implementa el algoritmo oficial de validación del SII
"""

import re

def validate_chilean_rut(rut):
    """
    Valida un RUT chileno según el algoritmo oficial
    
    Args:
        rut (str): RUT a validar (con o sin formato)
        
    Returns:
        dict: Resultado de la validación con keys:
            - is_valid (bool): True si el RUT es válido
            - error (str): Mensaje de error si no es válido
            - formatted_rut (str): RUT formateado si es válido
    """
    try:
        # Limpiar el RUT de puntos y guiones
        clean_rut = re.sub(r'[.-]', '', rut)
        
        # Verificar longitud mínima
        if len(clean_rut) < 8:
            return {
                'is_valid': False,
                'error': 'El RUT debe tener al menos 8 dígitos'
            }
        
        # Verificar longitud máxima
        if len(clean_rut) > 9:
            return {
                'is_valid': False,
                'error': 'El RUT no puede tener más de 9 dígitos'
            }
        
        # Separar número y dígito verificador
        rut_number = clean_rut[:-1]
        dv = clean_rut[-1].upper()
        
        # Verificar que el número sea válido
        if not rut_number.isdigit():
            return {
                'is_valid': False,
                'error': 'El RUT debe contener solo números y un dígito verificador'
            }
        
        # Verificar que el dígito verificador sea válido
        if not re.match(r'^[0-9K]$', dv):
            return {
                'is_valid': False,
                'error': 'El dígito verificador debe ser un número del 0-9 o la letra K'
            }
        
        # Calcular dígito verificador correcto
        calculated_dv = calculate_dv(rut_number)
        
        # Comparar dígito verificador calculado con el ingresado
        if calculated_dv != dv:
            return {
                'is_valid': False,
                'error': f'Dígito verificador incorrecto. Debería ser: {calculated_dv}'
            }
        
        # Validaciones adicionales de RUTs comunes inválidos
        if not validate_rut_not_common(rut_number):
            return {
                'is_valid': False,
                'error': 'RUT con formato sospechoso o inválido'
            }
        
        # Formatear RUT para mostrar
        formatted_rut = format_rut(clean_rut)
        
        return {
            'is_valid': True,
            'formatted_rut': formatted_rut
        }
        
    except Exception as e:
        return {
            'is_valid': False,
            'error': f'Error validando RUT: {str(e)}'
        }

def calculate_dv(rut_number):
    """
    Calcula el dígito verificador de un RUT
    
    Args:
        rut_number (str): Número del RUT sin dígito verificador
        
    Returns:
        str: Dígito verificador calculado
    """
    sum_val = 0
    multiplier = 2
    
    # Calcular suma ponderada
    for i in range(len(rut_number) - 1, -1, -1):
        sum_val += int(rut_number[i]) * multiplier
        multiplier = 7 if multiplier == 2 else multiplier + 1
    
    # Calcular dígito verificador
    remainder = sum_val % 11
    dv = 11 - remainder
    
    # Convertir a string según reglas del SII
    if dv == 11:
        return '0'
    elif dv == 10:
        return 'K'
    else:
        return str(dv)

def format_rut(clean_rut):
    """
    Formatea un RUT para mostrar
    
    Args:
        clean_rut (str): RUT limpio (sin formato)
        
    Returns:
        str: RUT formateado (XX.XXX.XXX-X)
    """
    rut_number = clean_rut[:-1]
    dv = clean_rut[-1]
    
    # Agregar puntos cada 3 dígitos desde la derecha
    formatted = ''
    for i in range(len(rut_number) - 1, -1, -1):
        if (len(rut_number) - 1 - i) % 3 == 0 and i != len(rut_number) - 1:
            formatted = '.' + formatted
        formatted = rut_number[i] + formatted
    
    # Agregar dígito verificador con guión
    return f"{formatted}-{dv}"

def validate_rut_not_common(rut_number):
    """
    Valida que el RUT no sea un RUT común inválido
    
    Args:
        rut_number (str): Número del RUT sin dígito verificador
        
    Returns:
        bool: True si el RUT es válido y no es común inválido
    """
    # Rechazar RUTs que empiecen con 0 (no válidos en Chile)
    if rut_number.startswith('0'):
        return False
    
    # Rechazar RUTs muy pequeños (menos de 1.000.000)
    if int(rut_number) < 1000000:
        return False
    
    # Rechazar RUTs que empiecen con 1 seguido de muchos ceros (sospechosos)
    if rut_number.startswith('1') and re.match(r'^1[0]+', rut_number):
        return False
    
    return True
