# 🚀 LeanMaker - Plataforma de Vinculación Académica-Profesional

## 📋 Descripción General

**LeanMaker** es una plataforma integral de vinculación que conecta estudiantes universitarios con empresas para realizar proyectos profesionales reales. El sistema implementa un modelo de progresión basado en niveles API (Academic Professional Integration) que permite a los estudiantes desarrollar sus habilidades de manera estructurada mientras las empresas obtienen talento calificado para sus proyectos.

## 🎯 Propósito del Proyecto

### Problema que Resuelve
- **Brecha entre academia y empresa**: Conecta estudiantes con proyectos reales
- **Falta de experiencia práctica**: Proporciona oportunidades de trabajo real
- **Gestión compleja de proyectos**: Sistema integral para administrar todo el ciclo de vida
- **Evaluación subjetiva**: Sistema de niveles y métricas objetivas

### Solución Implementada
Una plataforma completa que gestiona todo el proceso desde la publicación de proyectos hasta la evaluación final, con un sistema de niveles que garantiza la calidad y progresión de los participantes.

## 🏗️ Arquitectura del Sistema

### Backend (Django)
- **Framework**: Django 4.2+ con Python 3.12+
- **Base de Datos**: SQL Server en Azure
- **Autenticación**: JWT Tokens con refresh automático
- **API**: RESTful con endpoints bien estructurados
- **Modelos**: 25+ modelos principales con relaciones complejas
- **Middleware**: Sistema de monitoreo, seguridad y logging

### Frontend (React + TypeScript)
- **Framework**: React 18 con TypeScript
- **UI Framework**: Material-UI con tema personalizado
- **Estado**: Context API + Custom Hooks
- **Rutas**: React Router con protección por roles
- **Build Tool**: Vite para desarrollo rápido
- **Validación**: Yup + Formik

## 👥 Roles y Funcionalidades

### 🎓 Estudiante
- **Dashboard personalizado** con métricas de progreso
- **Sistema de niveles API** (1-4) con progresión automática
- **Búsqueda inteligente** de proyectos por habilidades y nivel
- **Gestión de aplicaciones** y seguimiento de estado
- **Registro de horas** con validación automática
- **Evaluaciones bidireccionales** con empresas
- **Calendario integrado** para eventos y deadlines
- **Sistema de notificaciones** en tiempo real

### 🏢 Empresa
- **Publicación de proyectos** con especificaciones TRL
- **Gestión de aplicaciones** y selección de candidatos
- **Búsqueda de estudiantes** por habilidades y nivel API
- **Sistema de entrevistas** integrado
- **Evaluación de estudiantes** con métricas objetivas
- **Dashboard analítico** con estadísticas de proyectos
- **Gestión de documentos** y recursos

### 👨‍💼 Administrador
- **Panel de control completo** con métricas globales
- **Gestión de usuarios** y roles
- **Aprobación de niveles API** y solicitudes
- **Monitoreo de actividad** en tiempo real
- **Sistema de reportes** y analytics
- **Configuración de plataforma** y políticas
- **Backup y mantenimiento** de datos

## 🔄 Flujo Principal del Sistema

### 1. Registro y Onboarding
- Registro diferenciado por rol (estudiante/empresa)
- Validación de datos y verificación de identidad
- Asignación automática de nivel API inicial (nivel 1 para estudiantes)
- Configuración de perfil y preferencias

### 2. Sistema de Niveles API
- **Nivel 1**: 20 horas/semana, proyectos TRL 1-2
- **Nivel 2**: 40 horas/semana, proyectos TRL 1-4
- **Nivel 3**: 80 horas/semana, proyectos TRL 1-6
- **Nivel 4**: 160 horas/semana, proyectos TRL 1-9
- Progresión automática basada en evaluaciones y horas completadas

### 3. Gestión de Proyectos
- Publicación con especificaciones TRL y nivel API requerido
- Filtrado automático por compatibilidad de nivel
- Sistema de aplicaciones con estados (pendiente, aprobada, rechazada)
- Asignación de estudiantes y seguimiento de progreso

### 4. Evaluación y Métricas
- Evaluaciones bidireccionales (estudiante ↔ empresa)
- Cálculo automático de GPA y rating
- Sistema de strikes y records disciplinarios
- Reportes de rendimiento y tendencias

## 🛠️ Tecnologías Implementadas

### Backend
- **Django 4.2+**: Framework web robusto
- **SQL Server**: Base de datos empresarial
- **JWT Authentication**: Autenticación segura
- **Celery + Redis**: Tareas asíncronas
- **Django Debug Toolbar**: Optimización en desarrollo
- **WhiteNoise**: Servir archivos estáticos
- **Pillow**: Procesamiento de imágenes

### Frontend
- **React 18**: Biblioteca de UI moderna
- **TypeScript**: Tipado estático
- **Material-UI**: Componentes de diseño
- **React Router**: Navegación SPA
- **Axios**: Cliente HTTP
- **Formik + Yup**: Manejo de formularios
- **React Big Calendar**: Calendario integrado

### DevOps y Herramientas
- **Vite**: Build tool rápido
- **ESLint + Prettier**: Calidad de código
- **TypeScript**: Verificación de tipos
- **Git**: Control de versiones
- **Nginx**: Servidor web
- **Gunicorn**: Servidor WSGI

## 📊 Funcionalidades Avanzadas

### Sistema de Geolocalización
- Tracking de ubicación de usuarios activos
- Integración con Google Maps
- Historial de ubicaciones para auditoría
- Filtrado por región geográfica

### Sistema de Notificaciones
- Notificaciones en tiempo real
- Notificaciones masivas para administradores
- Configuración personalizada por usuario
- Historial de notificaciones

### Sistema de Reportes
- Analytics de participación
- Métricas de rendimiento por nivel
- Reportes de horas y proyectos
- Análisis de tendencias temporales

### Gestión de Documentos
- Subida y gestión de archivos
- Validación de tipos de archivo
- Almacenamiento seguro
- Control de versiones

## 🔒 Seguridad y Privacidad

- **Autenticación JWT** con refresh tokens
- **Middleware de seguridad** personalizado
- **Rate limiting** para prevenir abusos
- **Validación de datos** en frontend y backend
- **Logging de actividad** para auditoría
- **Backup automático** de datos críticos

## 📈 Métricas y KPIs

### Para Estudiantes
- Nivel API actual y progresión
- Horas completadas vs. requeridas
- GPA promedio de evaluaciones
- Tasa de aceptación de aplicaciones

### Para Empresas
- Número de proyectos activos
- Tasa de finalización de proyectos
- Satisfacción promedio de estudiantes
- Tiempo promedio de selección

### Para Administradores
- Usuarios activos por rol
- Proyectos publicados vs. completados
- Distribución de niveles API
- Métricas de engagement

## 🚀 Estado del Proyecto

### ✅ Completado
- Sistema completo de autenticación y autorización
- Gestión integral de proyectos y aplicaciones
- Sistema de niveles API funcional
- Evaluaciones bidireccionales
- Dashboard para todos los roles
- Sistema de notificaciones
- Gestión de horas y reportes

### 🔄 En Desarrollo
- Optimizaciones de rendimiento
- Nuevas funcionalidades de analytics
- Mejoras en la experiencia de usuario
- Integración con más servicios externos

## 🎯 Impacto y Beneficios

### Para Estudiantes
- **Experiencia real** en proyectos empresariales
- **Progresión estructurada** de habilidades
- **Networking** con empresas del sector
- **Portfolio** de proyectos reales

### Para Empresas
- **Acceso a talento** calificado y estructurado
- **Reducción de costos** de reclutamiento
- **Proyectos ejecutados** con calidad garantizada
- **Evaluación objetiva** de candidatos

### Para Instituciones Educativas
- **Vinculación efectiva** con el sector productivo
- **Métricas objetivas** de competencias
- **Mejora continua** de programas académicos
- **Diferenciación** en el mercado educativo

## 📞 Contacto y Soporte

Este proyecto demuestra competencias avanzadas en:
- **Desarrollo Full-Stack** con tecnologías modernas
- **Arquitectura de software** escalable
- **Gestión de bases de datos** complejas
- **Implementación de sistemas** de autenticación seguros
- **Desarrollo de APIs** RESTful
- **Interfaces de usuario** modernas y responsivas
- **Integración de servicios** externos
- **DevOps** y despliegue de aplicaciones

---

**LeanMaker** representa una solución completa e innovadora para la vinculación académica-profesional, demostrando habilidades técnicas avanzadas y comprensión profunda de las necesidades del mercado educativo y empresarial. 