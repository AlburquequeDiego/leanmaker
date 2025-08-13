/**
 * Validador de RUT chileno
 * Implementa el algoritmo oficial de validación del SII
 */

export interface RutValidationResult {
  isValid: boolean;
  error?: string;
  formattedRut?: string;
}

/**
 * Valida un RUT chileno según el algoritmo oficial
 * @param rut - RUT a validar (con o sin formato)
 * @returns Resultado de la validación
 */
export function validateChileanRut(rut: string): RutValidationResult {
  // Limpiar el RUT de puntos y guiones
  const cleanRut = rut.replace(/[.-]/g, '');
  
  // Verificar longitud mínima
  if (cleanRut.length < 8) {
    return {
      isValid: false,
      error: 'El RUT debe tener al menos 8 dígitos'
    };
  }
  
  // Verificar longitud máxima
  if (cleanRut.length > 9) {
    return {
      isValid: false,
      error: 'El RUT no puede tener más de 9 dígitos'
    };
  }
  
  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  // Verificar que el número sea válido
  if (!/^\d+$/.test(rutNumber)) {
    return {
      isValid: false,
      error: 'El RUT debe contener solo números y un dígito verificador'
    };
  }
  
  // Verificar que el dígito verificador sea válido
  if (!/^[0-9K]$/.test(dv)) {
    return {
      isValid: false,
      error: 'El dígito verificador debe ser un número del 0-9 o la letra K'
    };
  }
  
  // Calcular dígito verificador correcto
  const calculatedDv = calculateDv(rutNumber);
  
  // Comparar dígito verificador calculado con el ingresado
  if (calculatedDv !== dv) {
    return {
      isValid: false,
      error: `Dígito verificador incorrecto. Debería ser: ${calculatedDv}`
    };
  }
  
  // Formatear RUT para mostrar
  const formattedRut = formatRut(cleanRut);
  
  return {
    isValid: true,
    formattedRut
  };
}

/**
 * Calcula el dígito verificador de un RUT
 * @param rutNumber - Número del RUT sin dígito verificador
 * @returns Dígito verificador calculado
 */
function calculateDv(rutNumber: string): string {
  let sum = 0;
  let multiplier = 2;
  
  // Calcular suma ponderada
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  // Calcular dígito verificador
  const remainder = sum % 11;
  const dv = 11 - remainder;
  
  // Convertir a string según reglas del SII
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}

/**
 * Formatea un RUT para mostrar
 * @param cleanRut - RUT limpio (sin formato)
 * @returns RUT formateado (XX.XXX.XXX-X)
 */
function formatRut(cleanRut: string): string {
  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Agregar puntos cada 3 dígitos desde la derecha
  let formatted = '';
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    if ((rutNumber.length - 1 - i) % 3 === 0 && i !== rutNumber.length - 1) {
      formatted = '.' + formatted;
    }
    formatted = rutNumber[i] + formatted;
  }
  
  // Agregar dígito verificador con guión
  return `${formatted}-${dv}`;
}

/**
 * Valida RUTs comunes que no deberían ser aceptados
 * @param rut - RUT a validar
 * @returns true si el RUT es válido y no es un RUT común inválido
 */
export function validateRutNotCommon(rut: string): RutValidationResult {
  const basicValidation = validateChileanRut(rut);
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  const cleanRut = rut.replace(/[.-]/g, '');
  const rutNumber = cleanRut.slice(0, -1);
  
  // Rechazar RUTs que empiecen con 0 (no válidos en Chile)
  if (rutNumber.startsWith('0')) {
    return {
      isValid: false,
      error: 'Los RUTs no pueden empezar con 0'
    };
  }
  
  // Rechazar RUTs muy pequeños (menos de 1.000.000)
  if (parseInt(rutNumber) < 1000000) {
    return {
      isValid: false,
      error: 'RUT demasiado pequeño para ser válido'
    };
  }
  
  // Rechazar RUTs que empiecen con 1 seguido de muchos ceros (sospechosos)
  if (rutNumber.startsWith('1') && rutNumber.match(/^1[0]+/)) {
    return {
      isValid: false,
      error: 'RUT con formato sospechoso'
    };
  }
  
  return {
    isValid: true,
    formattedRut: basicValidation.formattedRut
  };
}
