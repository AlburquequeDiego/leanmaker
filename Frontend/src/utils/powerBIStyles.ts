/**
 * Estilos Power BI Modern para el Dashboard
 * Configuración centralizada de colores, gradientes y efectos
 */

// Paleta de colores Power BI Modern
export const powerBIColors = [
  '#10b981', // Verde esmeralda
  '#3b82f6', // Azul brillante
  '#f59e0b', // Amarillo dorado
  '#ef4444', // Rojo vibrante
  '#8b5cf6', // Púrpura vibrante
  '#06b6d4', // Cian brillante
  '#ec4899', // Rosa vibrante
  '#f97316', // Naranja vibrante
  '#22c55e', // Verde lima
  '#6366f1'  // Indigo vibrante
];

// Gradientes Power BI Modern
export const powerBIGradients = {
  primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  secondary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  tertiary: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  cyan: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  pink: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
};

// Estilos de tooltip Power BI Modern
export const powerBITooltipStyles = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  color: '#1e293b',
  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 16px'
};

export const powerBITooltipDarkStyles = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '12px',
  color: '#f1f5f9',
  boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 16px'
};

// Estilos de cards Power BI Modern
export const powerBICardStyles = {
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  backdropFilter: 'blur(20px)',
  position: 'relative' as const,
  overflow: 'hidden' as const,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 6px 20px rgba(0, 0, 0, 0.1)'
  }
};

// Configuración de gráficos Power BI Modern
export const powerBIGraphConfig = {
  // Configuración de barras
  bar: {
    radius: [12, 12, 0, 0],
    strokeWidth: 2,
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
  },
  
  // Configuración de líneas
  line: {
    strokeWidth: 4,
    dot: {
      r: 6,
      strokeWidth: 2,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
    },
    activeDot: {
      r: 8,
      strokeWidth: 2,
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
    }
  },
  
  // Configuración de gráficos circulares
  pie: {
    outerRadius: 120,
    innerRadius: 60,
    strokeWidth: 4,
    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))'
  },
  
  // Configuración de áreas
  area: {
    strokeWidth: 3,
    fillOpacity: 0.8
  }
};

// Configuración de ejes Power BI Modern
export const powerBIAxisConfig = {
  tick: {
    fontSize: 12,
    fontWeight: 600,
    fill: '#64748b'
  },
  axisLine: {
    stroke: '#e2e8f0',
    strokeWidth: 2
  },
  tickLine: {
    stroke: '#e2e8f0',
    strokeWidth: 2
  }
};

export const powerBIAxisDarkConfig = {
  tick: {
    fontSize: 12,
    fontWeight: 600,
    fill: '#cbd5e1'
  },
  axisLine: {
    stroke: '#334155',
    strokeWidth: 2
  },
  tickLine: {
    stroke: '#334155',
    strokeWidth: 2
  }
};

// Configuración de grid Power BI Modern
export const powerBIGridConfig = {
  strokeDasharray: '3 3',
  opacity: 0.3,
  stroke: '#f1f5f9'
};

export const powerBIGridDarkConfig = {
  strokeDasharray: '3 3',
  opacity: 0.3,
  stroke: '#334155'
};

// Función para obtener colores consistentes
export const getPowerBIColor = (index: number): string => {
  return powerBIColors[index % powerBIColors.length];
};

// Función para crear gradientes personalizados
export const createPowerBIGradient = (color: string, opacity1: number = 0.9, opacity2: number = 0.2): string => {
  return `linear-gradient(135deg, ${color} ${opacity1} 0%, ${color} ${opacity2} 100%)`;
};

// Función para crear sombras personalizadas
export const createPowerBIShadow = (color: string, opacity: number = 0.3): string => {
  return `drop-shadow(0 4px 8px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')})`;
};
