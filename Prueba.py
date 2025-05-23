## Arquitectura del Proyecto

# La arquitectura de LEANMAKER está basada en una estructura modular y desacoplada, utilizando contenedores para facilitar el despliegue, la escalabilidad y el mantenimiento. A continuación se describe la arquitectura general:

'''
+-------------------+         +---------------------+         +---------------------+
|                   |         |                     |         |                     |
|    Frontend       | <-----> |    Backend API      | <-----> |    Base de Datos    |
|  (React + Router) |  REST   | (Django / Node.js)  |  ORM    | (SQL Server/Postgre)|
|                   |         |                     |         |                     |
+-------------------+         +---------------------+         +---------------------+
         |                             |
         |                             |
         v                             v
+-------------------+         +---------------------+
|                   |         |                     |
|  File Server      |         |  Sistema de         |
|  (PDF/Word)       |         |  Autenticación      |
|                   |         | (Credenciales MS)   |
+-------------------+         +---------------------+

+-------------------+
|                   |
|   Docker Compose  |  --> Orquestación de todos los servicios
|                   |
+-------------------+
'''

# Componentes Principales

# - **Frontend**: Aplicación React con React Router DOM para navegación SPA.
# - **Backend API**: Django (principal) y Node.js (servicios complementarios).
# - **Base de Datos**: SQL Server y/o PostgreSQL, gestionadas por el backend.
# - **File Server**: Servicio dedicado para almacenamiento y gestión de documentos PDF y Word.
# - **Autenticación**: Integración con el sistema de credenciales de Microsoft.
# - **Contenedores**: Docker para empaquetar y desplegar frontend, backend, base de datos y file server.
# - **Orquestación**: Docker Compose para levantar todos los servicios de manera conjunta.
# - **Editores de Código**: Visual Studio Code, Cursor, Replit para el desarrollo colaborativo.
# - **Control de Versiones**: Git para la gestión del código fuente.
# - **Despliegue**: Servidores/Data Center INACAP.

# Flujo General

# 1. El usuario accede a la aplicación web (Frontend).
# 2. El frontend se comunica con el backend a través de API REST.
# 3. El backend gestiona la lógica de negocio, autenticación y acceso a la base de datos.
# 4. El backend interactúa con el file server para la gestión de documentos.
# 5. Todo el sistema se ejecuta en contenedores Docker, facilitando el despliegue y la escalabilidad.

# ---