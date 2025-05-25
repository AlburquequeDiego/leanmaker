# LEANMAKER - Plataforma de Gestión de Proyectos Académicos

## Descripción
LEANMAKER es una plataforma web que conecta estudiantes de INACAP con empresas, facilitando la gestión de proyectos académicos y prácticas profesionales. El sistema permite la gestión de proyectos, postulaciones, seguimiento de horas de práctica y evaluación de desempeño.

## Estructura del Proyecto
LEANMAKER/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── context/
│   └── public/
├── backend/
│   ├── apps/
│   ├── config/
│   ├── templates/
│   ├── static/
│   ├── media/
│   ├── utils/
│   └── tests/
├── database/
│   ├── migrations/
│   ├── scripts/
│   ├── backups/
│   └── schemas/
├── docs/
│   ├── api/
│   ├── frontend/
│   ├── backend/
│   ├── database/
│   └── deployment/
└── file-server/
    ├── uploads/
    ├── temp/
    └── logs/

## Tecnologías Utilizadas
- **Frontend**: React, React Router DOM
- **Backend**: Django
- **Base de Datos**: SQL Server
- **Control de Versiones**: Git
- **Contenedores**: Docker (empaquetado y despliegue de frontend, backend y base de datos)
- **Editores de Código**: Visual Studio Code, Cursor, Replit
- **Autenticación**: Sistema de credenciales de Microsoft
- **Despliegue**: Servidores/Data Center INACAP
- **Gestión de Documentos**: Servidor dedicado para archivos PDF y Word

## Características Principales
- Sistema de autenticación y autorización
- Gestión de proyectos empresariales
- Sistema de postulaciones
- Seguimiento de horas de práctica
- Sistema de evaluación y feedback
- Gestión de entrevistas y calendarios
- Sistema de notificaciones
- Portafolio de estudiantes
- Almacenamiento y gestión de documentos (PDF, Word)

## Tipos de Usuarios
1. **Estudiantes**
   - Niveles API (1-4)
   - Gestión de postulaciones
   - Portafolio personal
   - Seguimiento de horas

2. **Empresas**
   - Publicación de proyectos
   - Gestión de postulaciones
   - Evaluación de estudiantes
   - Calendario de entrevistas

3. **Administrador**
   - Gestión de usuarios
   - Supervisión del sistema
   - Gestión de niveles API
   - Control de acceso

## Herramientas a Utilizar
- **Git**: Control de versiones
- **Docker**: Empaquetado y despliegue
- **Visual Studio Code / Cursor**: Editores de código
- **React Router DOM**: Ruteo en frontend
- **Sistema de credenciales de Microsoft**: Autenticación

## Entorno de Desarrollo
- **Lenguajes**: Python 3.8+, JavaScript
- **Bases de Datos**: SQL Server
- **Contenedores**: Docker
- **Editores**: VS Code, Cursor, Replit

## Metodología
- **Metodología**: LITERA incremental (desarrollo iterativo y por etapas)

## Pruebas y Despliegue
- **Pruebas de estrés**: Para asegurar la escalabilidad y rendimiento
- **Despliegue**: Servidores/Data Center INACAP usando Docker

## Requisitos Previos
- Python 3.8+
- Node.js 16+
- SQL Server 
- Docker
- Git

## Licencia
Todos los derechos reservados 
