#!/usr/bin/env node

/**
 * Script automatizado para analizar las 30 interfaces del sistema LeanMaker
 * Verifica: bandeja de entrada, visualización, hooks, servicios y endpoints
 */

const fs = require('fs');
const path = require('path');

// Lista de las 30 interfaces principales
const INTERFACES = [
  // ESTUDIANTE (10)
  { name: 'Dashboard Estudiante', file: 'StudentDashboard.tsx', role: 'student', type: 'dashboard' },
  { name: 'Proyectos Disponibles', file: 'Projects/AvailableProjects.tsx', role: 'student', type: 'list' },
  { name: 'Mis Aplicaciones', file: 'MyApplications.tsx', role: 'student', type: 'list' },
  { name: 'Mis Proyectos', file: 'MyProjects.tsx', role: 'student', type: 'list' },
  { name: 'Evaluaciones', file: 'Evaluations.tsx', role: 'student', type: 'list' },
  { name: 'Calendario', file: 'Calendar.tsx', role: 'student', type: 'calendar' },
  { name: 'Notificaciones', file: 'Notifications.tsx', role: 'student', type: 'list' },
  { name: 'Perfil', file: 'Profile.tsx', role: 'student', type: 'form' },
  { name: 'Cuestionario API', file: 'APIQuestionnaire.tsx', role: 'student', type: 'form' },
  { name: 'Resultados API', file: 'APIResults.tsx', role: 'student', type: 'list' },
  
  // EMPRESA (11)
  { name: 'Dashboard Empresa', file: 'CompanyDashboard.tsx', role: 'company', type: 'dashboard' },
  { name: 'Proyectos Publicados', file: 'Projects.tsx', role: 'company', type: 'list' },
  { name: 'Postulaciones Recibidas', file: 'Applications.tsx', role: 'company', type: 'list' },
  { name: 'Buscar Estudiantes', file: 'SearchStudents.tsx', role: 'company', type: 'list' },
  { name: 'Evaluaciones', file: 'Evaluations.tsx', role: 'company', type: 'list' },
  { name: 'Entrevistas', file: 'Interviews.tsx', role: 'company', type: 'list' },
  { name: 'Calendario', file: 'Calendar.tsx', role: 'company', type: 'calendar' },
  { name: 'Notificaciones', file: 'Notifications.tsx', role: 'company', type: 'list' },
  { name: 'Perfil', file: 'Profile.tsx', role: 'company', type: 'form' },
  { name: 'Strikes', file: 'Strikes.tsx', role: 'company', type: 'list' },
  { name: 'Publicar Proyectos', file: 'PublishProjects.tsx', role: 'company', type: 'form' },
  
  // ADMIN (9)
  { name: 'Dashboard Admin', file: 'AdminDashboard.tsx', role: 'admin', type: 'dashboard' },
  { name: 'Gestión Usuarios', file: 'UsuariosAdmin.tsx', role: 'admin', type: 'list' },
  { name: 'Validación Horas', file: 'ValidacionHorasAdmin.tsx', role: 'admin', type: 'list' },
  { name: 'Gestión Empresas', file: 'GestionEmpresasAdmin.tsx', role: 'admin', type: 'list' },
  { name: 'Gestión Estudiantes', file: 'GestionEstudiantesAdmin.tsx', role: 'admin', type: 'list' },
  { name: 'Gestión Proyectos', file: 'GestionProyectosAdmin.tsx', role: 'admin', type: 'list' },
  { name: 'Gestión Evaluaciones', file: 'GestionEvaluacionesAdmin.tsx', role: 'admin', type: 'list' },
  { name: 'Configuración Plataforma', file: 'ConfiguracionPlataformaAdmin.tsx', role: 'admin', type: 'form' },
  { name: 'Notificaciones Admin', file: 'NotificacionesAdmin.tsx', role: 'admin', type: 'list' }
];

// Patrones para detectar elementos clave
const PATTERNS = {
  // Bandeja de entrada (componentes que reciben datos)
  dataInbox: [
    /useState\s*\(\s*\[\s*\]\s*\)/, // Estado para datos
    /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{/, // Efectos para cargar datos
    /fetch.*\(/, // Llamadas a API
    /apiService\.get/, // Servicios de API
    /useRealTimeData/, // Hook de datos en tiempo real
    /useDashboardStats/, // Hook de estadísticas
    /loading.*useState/, // Estado de carga
    /error.*useState/, // Estado de error
  ],
  
  // Visualización (componentes que muestran datos)
  visualization: [
    /Table/, // Tablas
    /Card/, // Tarjetas
    /Paper/, // Papeles
    /List/, // Listas
    /Grid/, // Grillas
    /Box.*sx/, // Contenedores con estilos
    /Typography/, // Texto
    /CircularProgress/, // Indicadores de carga
    /Alert/, // Alertas
    /Chip/, // Chips
    /Button/, // Botones
    /IconButton/, // Botones con iconos
  ],
  
  // Interacción (componentes que permiten interacción)
  interaction: [
    /onClick/, // Clicks
    /onChange/, // Cambios
    /onSubmit/, // Envíos
    /handle/, // Manejadores
    /Dialog/, // Diálogos
    /Modal/, // Modales
    /TextField/, // Campos de texto
    /Select/, // Selectores
    /Autocomplete/, // Autocompletado
    /Checkbox/, // Checkboxes
    /Radio/, // Radios
  ],
  
  // Endpoints (URLs de API)
  endpoints: [
    /\/api\/projects/, // Proyectos
    /\/api\/applications/, // Aplicaciones
    /\/api\/users/, // Usuarios
    /\/api\/dashboard/, // Dashboard
    /\/api\/evaluations/, // Evaluaciones
    /\/api\/notifications/, // Notificaciones
    /\/api\/calendar/, // Calendario
    /\/api\/students/, // Estudiantes
    /\/api\/companies/, // Empresas
  ]
};

function analyzeFile(filePath, interfaceInfo) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const analysis = {
      name: interfaceInfo.name,
      role: interfaceInfo.role,
      type: interfaceInfo.type,
      file: interfaceInfo.file,
      hasDataInbox: false,
      hasVisualization: false,
      hasInteraction: false,
      hasEndpoints: false,
      patterns: {
        dataInbox: [],
        visualization: [],
        interaction: [],
        endpoints: []
      },
      issues: []
    };
    
    // Verificar patrones de bandeja de entrada
    PATTERNS.dataInbox.forEach((pattern, index) => {
      if (pattern.test(content)) {
        analysis.hasDataInbox = true;
        analysis.patterns.dataInbox.push(`Pattern ${index + 1}`);
      }
    });
    
    // Verificar patrones de visualización
    PATTERNS.visualization.forEach((pattern, index) => {
      if (pattern.test(content)) {
        analysis.hasVisualization = true;
        analysis.patterns.visualization.push(`Pattern ${index + 1}`);
      }
    });
    
    // Verificar patrones de interacción
    PATTERNS.interaction.forEach((pattern, index) => {
      if (pattern.test(content)) {
        analysis.hasInteraction = true;
        analysis.patterns.interaction.push(`Pattern ${index + 1}`);
      }
    });
    
    // Verificar endpoints
    PATTERNS.endpoints.forEach((pattern, index) => {
      if (pattern.test(content)) {
        analysis.hasEndpoints = true;
        analysis.patterns.endpoints.push(`Pattern ${index + 1}`);
      }
    });
    
    // Detectar problemas
    if (!analysis.hasDataInbox) {
      analysis.issues.push('No se detectó bandeja de entrada de datos');
    }
    if (!analysis.hasVisualization) {
      analysis.issues.push('No se detectó visualización de datos');
    }
    if (!analysis.hasInteraction) {
      analysis.issues.push('No se detectó interacción con datos');
    }
    if (!analysis.hasEndpoints) {
      analysis.issues.push('No se detectaron endpoints de API');
    }
    
    return analysis;
  } catch (error) {
    return {
      name: interfaceInfo.name,
      role: interfaceInfo.role,
      type: interfaceInfo.type,
      file: interfaceInfo.file,
      hasDataInbox: false,
      hasVisualization: false,
      hasInteraction: false,
      hasEndpoints: false,
      patterns: { dataInbox: [], visualization: [], interaction: [], endpoints: [] },
      issues: [`Error al leer archivo: ${error.message}`]
    };
  }
}

function generateReport(analyses) {
  console.log('=== ANÁLISIS AUTOMATIZADO DE LAS 30 INTERFACES ===\n');
  
  const summary = {
    total: analyses.length,
    withDataInbox: 0,
    withVisualization: 0,
    withInteraction: 0,
    withEndpoints: 0,
    issues: 0
  };
  
  analyses.forEach(analysis => {
    if (analysis.hasDataInbox) summary.withDataInbox++;
    if (analysis.hasVisualization) summary.withVisualization++;
    if (analysis.hasInteraction) summary.withInteraction++;
    if (analysis.hasEndpoints) summary.withEndpoints++;
    if (analysis.issues.length > 0) summary.issues++;
    
    console.log(`📋 ${analysis.name} (${analysis.role.toUpperCase()})`);
    console.log(`   📁 Archivo: ${analysis.file}`);
    console.log(`   🎯 Tipo: ${analysis.type}`);
    console.log(`   📥 Bandeja de entrada: ${analysis.hasDataInbox ? '✅' : '❌'}`);
    console.log(`   👁️ Visualización: ${analysis.hasVisualization ? '✅' : '❌'}`);
    console.log(`   🖱️ Interacción: ${analysis.hasInteraction ? '✅' : '❌'}`);
    console.log(`   🔗 Endpoints: ${analysis.hasEndpoints ? '✅' : '❌'}`);
    
    if (analysis.issues.length > 0) {
      console.log(`   ⚠️ Problemas:`);
      analysis.issues.forEach(issue => console.log(`      - ${issue}`));
    }
    console.log('');
  });
  
  console.log('=== RESUMEN ===');
  console.log(`Total de interfaces: ${summary.total}`);
  console.log(`Con bandeja de entrada: ${summary.withDataInbox}/${summary.total} (${Math.round(summary.withDataInbox/summary.total*100)}%)`);
  console.log(`Con visualización: ${summary.withVisualization}/${summary.total} (${Math.round(summary.withVisualization/summary.total*100)}%)`);
  console.log(`Con interacción: ${summary.withInteraction}/${summary.total} (${Math.round(summary.withInteraction/summary.total*100)}%)`);
  console.log(`Con endpoints: ${summary.withEndpoints}/${summary.total} (${Math.round(summary.withEndpoints/summary.total*100)}%)`);
  console.log(`Con problemas: ${summary.issues}/${summary.total} (${Math.round(summary.issues/summary.total*100)}%)`);
  
  return summary;
}

function main() {
  const analyses = [];
  
  INTERFACES.forEach(interfaceInfo => {
    let filePath;
    
    if (interfaceInfo.role === 'student') {
      filePath = path.join(__dirname, 'src/pages/Dashboard/Student', interfaceInfo.file);
    } else if (interfaceInfo.role === 'company') {
      filePath = path.join(__dirname, 'src/pages/Dashboard/Company', interfaceInfo.file);
    } else if (interfaceInfo.role === 'admin') {
      filePath = path.join(__dirname, 'src/pages/Dashboard/Admin', interfaceInfo.file);
    }
    
    const analysis = analyzeFile(filePath, interfaceInfo);
    analyses.push(analysis);
  });
  
  const summary = generateReport(analyses);
  
  // Guardar reporte en archivo
  const report = {
    timestamp: new Date().toISOString(),
    summary,
    details: analyses
  };
  
  fs.writeFileSync('interface_analysis_report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Reporte guardado en: interface_analysis_report.json');
}

if (require.main === module) {
  main();
}

module.exports = { analyzeFile, generateReport, INTERFACES, PATTERNS }; 