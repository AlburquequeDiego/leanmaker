-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LEANMAKER')
BEGIN
    CREATE DATABASE LEANMAKER;
END
GO

USE LEANMAKER;
GO

-- Crear esquema si no existe
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'dbo')
BEGIN
    EXEC('CREATE SCHEMA dbo');
END
GO

-- Tabla Usuario
CREATE TABLE [dbo].[Usuario] (
    [id_usuario] int PRIMARY KEY IDENTITY(1, 1),
    [nombre] varchar(100) NOT NULL,
    [correo] varchar(100) UNIQUE NOT NULL,
    [contraseña] varchar(255) NOT NULL,
    [rol] varchar(20) NOT NULL CHECK (rol IN ('estudiante', 'empresa', 'admin')),
    [estado] varchar(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    [verificado] bit DEFAULT 0,
    [fecha_registro] datetime DEFAULT GETDATE(),
    [ultima_modificacion] datetime DEFAULT GETDATE()
)
GO

-- Tabla Administrador
CREATE TABLE [dbo].[Administrador] (
    [id_administrador] int PRIMARY KEY,
    [departamento] varchar(100) NOT NULL,
    [nivel_acceso] int NOT NULL CHECK (nivel_acceso BETWEEN 1 AND 5),
    [permisos] nvarchar(MAX),
    [ultimo_acceso] datetime,
    CONSTRAINT FK_Administrador_Usuario FOREIGN KEY (id_administrador) 
        REFERENCES [dbo].[Usuario] (id_usuario) ON DELETE CASCADE
)
GO

-- Tabla Estudiante
CREATE TABLE [dbo].[Estudiante] (
    [id_estudiante] int PRIMARY KEY,
    [carrera] varchar(100) NOT NULL,
    [semestre] int NOT NULL CHECK (semestre BETWEEN 1 AND 12),
    [estado_actividad] varchar(20) DEFAULT 'disponible' 
        CHECK (estado_actividad IN ('disponible', 'ocupado', 'inactivo')),
    [strikes] int DEFAULT 0 CHECK (strikes >= 0),
    CONSTRAINT FK_Estudiante_Usuario FOREIGN KEY (id_estudiante) 
        REFERENCES [dbo].[Usuario] (id_usuario) ON DELETE CASCADE
)
GO

-- Tabla Empresa
CREATE TABLE [dbo].[Empresa] (
    [id_empresa] int PRIMARY KEY,
    [nombre_empresa] varchar(100) NOT NULL,
    [rubro] varchar(100) NOT NULL,
    [descripcion] nvarchar(MAX),
    [fecha_registro] datetime DEFAULT GETDATE(),
    CONSTRAINT FK_Empresa_Usuario FOREIGN KEY (id_empresa) 
        REFERENCES [dbo].[Usuario] (id_usuario) ON DELETE CASCADE
)
GO

-- Tabla NivelAPI
CREATE TABLE [dbo].[NivelAPI] (
    [id_nivel] int PRIMARY KEY IDENTITY(1, 1),
    [nivel] varchar(1) UNIQUE NOT NULL CHECK (nivel IN ('1', '2', '3', '4')),
    [descripcion] nvarchar(MAX) NOT NULL,
    [requisitos] nvarchar(MAX) NOT NULL,
    [fecha_creacion] datetime DEFAULT GETDATE()
)
GO

-- Tabla EstadoProyecto
CREATE TABLE [dbo].[EstadoProyecto] (
    [id_estado] int PRIMARY KEY IDENTITY(1, 1),
    [nombre] varchar(50) UNIQUE NOT NULL,
    [descripcion] nvarchar(MAX)
)
GO

-- Tabla Proyecto
CREATE TABLE [dbo].[Proyecto] (
    [id_proyecto] int PRIMARY KEY IDENTITY(1, 1),
    [id_empresa] int NOT NULL,
    [id_estado_actual] int NOT NULL,
    [titulo] varchar(200) NOT NULL,
    [descripcion] nvarchar(MAX) NOT NULL,
    [area] varchar(100) NOT NULL,
    [nivel_api_requerido] varchar(1) NOT NULL,
    [trl] int CHECK (trl BETWEEN 1 AND 9),
    [fecha_publicacion] datetime DEFAULT GETDATE(),
    [fecha_inicio] date,
    [fecha_estimada_fin] date,
    [fecha_real_fin] date,
    [ultima_modificacion] datetime DEFAULT GETDATE(),
    CONSTRAINT FK_Proyecto_Empresa FOREIGN KEY (id_empresa) 
        REFERENCES [dbo].[Empresa] (id_empresa),
    CONSTRAINT FK_Proyecto_Estado FOREIGN KEY (id_estado_actual) 
        REFERENCES [dbo].[EstadoProyecto] (id_estado),
    CONSTRAINT FK_Proyecto_NivelAPI FOREIGN KEY (nivel_api_requerido) 
        REFERENCES [dbo].[NivelAPI] (nivel),
    CONSTRAINT CHK_Fechas_Proyecto CHECK (
        (fecha_inicio IS NULL OR fecha_estimada_fin IS NULL OR fecha_inicio <= fecha_estimada_fin) AND
        (fecha_real_fin IS NULL OR fecha_inicio IS NULL OR fecha_real_fin >= fecha_inicio)
    )
)
GO

-- Tabla HistorialEstadoProyecto
CREATE TABLE [dbo].[HistorialEstadoProyecto] (
    [id_historial] int PRIMARY KEY IDENTITY(1, 1),
    [id_proyecto] int NOT NULL,
    [id_estado] int NOT NULL,
    [id_usuario] int NOT NULL,
    [fecha_cambio] datetime DEFAULT GETDATE(),
    [comentario] nvarchar(MAX),
    CONSTRAINT FK_Historial_Proyecto FOREIGN KEY (id_proyecto) 
        REFERENCES [dbo].[Proyecto] (id_proyecto),
    CONSTRAINT FK_Historial_Estado FOREIGN KEY (id_estado) 
        REFERENCES [dbo].[EstadoProyecto] (id_estado),
    CONSTRAINT FK_Historial_Usuario FOREIGN KEY (id_usuario) 
        REFERENCES [dbo].[Usuario] (id_usuario)
)
GO

-- Tabla Postulacion
CREATE TABLE [dbo].[Postulacion] (
    [id_postulacion] int PRIMARY KEY IDENTITY(1, 1),
    [id_estudiante] int NOT NULL,
    [id_proyecto] int NOT NULL,
    [fecha_postulacion] datetime DEFAULT GETDATE(),
    [estado_postulacion] varchar(20) DEFAULT 'pendiente' 
        CHECK (estado_postulacion IN ('pendiente', 'aceptada', 'rechazada', 'cancelada')),
    [motivo_rechazo] nvarchar(MAX),
    CONSTRAINT FK_Postulacion_Estudiante FOREIGN KEY (id_estudiante) 
        REFERENCES [dbo].[Estudiante] (id_estudiante),
    CONSTRAINT FK_Postulacion_Proyecto FOREIGN KEY (id_proyecto) 
        REFERENCES [dbo].[Proyecto] (id_proyecto),
    CONSTRAINT UQ_Estudiante_Proyecto UNIQUE (id_estudiante, id_proyecto)
)
GO

-- Tabla Asignacion
CREATE TABLE [dbo].[Asignacion] (
    [id_asignacion] int PRIMARY KEY IDENTITY(1, 1),
    [id_postulacion] int NOT NULL UNIQUE,
    [fecha_inicio] date NOT NULL,
    [fecha_fin] date,
    [tareas] nvarchar(MAX),
    [horas_registradas] int DEFAULT 0 CHECK (horas_registradas >= 0),
    [estado] varchar(20) DEFAULT 'en curso' 
        CHECK (estado IN ('en curso', 'completado', 'cancelado')),
    CONSTRAINT FK_Asignacion_Postulacion FOREIGN KEY (id_postulacion) 
        REFERENCES [dbo].[Postulacion] (id_postulacion)
)
GO

-- Tabla AsignacionAPI
CREATE TABLE [dbo].[AsignacionAPI] (
    [id_asignacion] int PRIMARY KEY IDENTITY(1, 1),
    [id_estudiante] int NOT NULL,
    [id_nivel] int NOT NULL,
    [id_administrador] int NOT NULL,
    [fecha_asignacion] datetime DEFAULT GETDATE(),
    [fecha_vencimiento] date,
    [estado] varchar(20) DEFAULT 'activo' 
        CHECK (estado IN ('activo', 'vencido', 'revocado')),
    [motivo] nvarchar(MAX),
    CONSTRAINT FK_AsignacionAPI_Estudiante FOREIGN KEY (id_estudiante) 
        REFERENCES [dbo].[Estudiante] (id_estudiante),
    CONSTRAINT FK_AsignacionAPI_Nivel FOREIGN KEY (id_nivel) 
        REFERENCES [dbo].[NivelAPI] (id_nivel),
    CONSTRAINT FK_AsignacionAPI_Administrador FOREIGN KEY (id_administrador) 
        REFERENCES [dbo].[Administrador] (id_administrador)
)
GO

-- Tabla EvaluacionProyecto
CREATE TABLE [dbo].[EvaluacionProyecto] (
    [id_evaluacion] int PRIMARY KEY IDENTITY(1, 1),
    [id_asignacion] int NOT NULL,
    [calificacion] int CHECK (calificacion BETWEEN 1 AND 5),
    [comentarios] nvarchar(MAX),
    [fecha_evaluacion] datetime DEFAULT GETDATE(),
    CONSTRAINT FK_Evaluacion_Asignacion FOREIGN KEY (id_asignacion) 
        REFERENCES [dbo].[Asignacion] (id_asignacion)
)
GO

-- Tabla Strike
CREATE TABLE [dbo].[Strike] (
    [id_strike] int PRIMARY KEY IDENTITY(1, 1),
    [id_estudiante] int NOT NULL,
    [motivo] nvarchar(MAX) NOT NULL,
    [fecha] datetime DEFAULT GETDATE(),
    [estado] varchar(20) DEFAULT 'activo' 
        CHECK (estado IN ('activo', 'resuelto', 'anulado')),
    [id_administrador] int NOT NULL,
    CONSTRAINT FK_Strike_Estudiante FOREIGN KEY (id_estudiante) 
        REFERENCES [dbo].[Estudiante] (id_estudiante),
    CONSTRAINT FK_Strike_Administrador FOREIGN KEY (id_administrador) 
        REFERENCES [dbo].[Administrador] (id_administrador)
)
GO

-- Tabla Certificado
CREATE TABLE [dbo].[Certificado] (
    [id_certificado] int PRIMARY KEY IDENTITY(1, 1),
    [id_estudiante] int NOT NULL,
    [nombre] varchar(100),
    [archivo_url] varchar(255),
    [fecha_subida] datetime DEFAULT GETDATE(),
    [tipo_certificado] varchar(50) NOT NULL,
    [valido_hasta] date,
    CONSTRAINT FK_Certificado_Estudiante FOREIGN KEY (id_estudiante) 
        REFERENCES [dbo].[Estudiante] (id_estudiante)
)
GO

-- Tabla Notificacion
CREATE TABLE [dbo].[Notificacion] (
    [id_notificacion] int PRIMARY KEY IDENTITY(1, 1),
    [id_usuario] int NOT NULL,
    [mensaje] nvarchar(MAX) NOT NULL,
    [tipo] varchar(20) NOT NULL 
        CHECK (tipo IN ('sistema', 'proyecto', 'postulacion', 'evaluacion')),
    [fecha_envio] datetime DEFAULT GETDATE(),
    [leido] bit DEFAULT 0,
    [fecha_lectura] datetime,
    CONSTRAINT FK_Notificacion_Usuario FOREIGN KEY (id_usuario) 
        REFERENCES [dbo].[Usuario] (id_usuario)
)
GO

-- Tabla PerfilEstudiante
CREATE TABLE [dbo].[PerfilEstudiante] (
    [id_perfil] int PRIMARY KEY IDENTITY(1, 1),
    [id_estudiante] int NOT NULL UNIQUE,
    [horas_totales_proyectos] int DEFAULT 0 CHECK (horas_totales_proyectos >= 0),
    [experiencia_laboral] nvarchar(MAX),
    [habilidades] nvarchar(MAX),
    [portafolio_url] varchar(255),
    [biografia] nvarchar(MAX),
    [fecha_actualizacion] datetime DEFAULT GETDATE(),
    [visibilidad] bit DEFAULT 1,
    CONSTRAINT FK_PerfilEstudiante_Estudiante FOREIGN KEY (id_estudiante) 
        REFERENCES [dbo].[Estudiante] (id_estudiante)
)
GO

-- Tabla ExperienciaProyecto
CREATE TABLE [dbo].[ExperienciaProyecto] (
    [id_experiencia] int PRIMARY KEY IDENTITY(1, 1),
    [id_perfil] int NOT NULL,
    [id_proyecto] int NOT NULL,
    [id_empresa] int NOT NULL,
    [rol_desempeñado] varchar(100) NOT NULL,
    [descripcion_tareas] nvarchar(MAX),
    [habilidades_aplicadas] nvarchar(MAX),
    [fecha_inicio] date NOT NULL,
    [fecha_fin] date,
    [horas_trabajadas] int NOT NULL CHECK (horas_trabajadas > 0),
    [calificacion_empresa] int CHECK (calificacion_empresa BETWEEN 1 AND 5),
    [comentarios_empresa] nvarchar(MAX),
    [fecha_registro] datetime DEFAULT GETDATE(),
    CONSTRAINT FK_Experiencia_Perfil FOREIGN KEY (id_perfil) 
        REFERENCES [dbo].[PerfilEstudiante] (id_perfil),
    CONSTRAINT FK_Experiencia_Proyecto FOREIGN KEY (id_proyecto) 
        REFERENCES [dbo].[Proyecto] (id_proyecto),
    CONSTRAINT FK_Experiencia_Empresa FOREIGN KEY (id_empresa) 
        REFERENCES [dbo].[Empresa] (id_empresa),
    CONSTRAINT CHK_Fechas_Experiencia CHECK (
        fecha_fin IS NULL OR fecha_inicio <= fecha_fin
    )
)
GO

-- Tabla Entrevista
CREATE TABLE [dbo].[Entrevista] (
    [id_entrevista] int PRIMARY KEY IDENTITY(1, 1),
    [id_proyecto] int NOT NULL,
    [id_estudiante] int NOT NULL,
    [id_empresa] int NOT NULL,
    [fecha] date NOT NULL,
    [hora] time NOT NULL,
    [link_reunion] varchar(255),
    [estado] varchar(20) DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'confirmada', 'realizada', 'cancelada')),
    [comentarios] nvarchar(MAX),
    [duracion_minutos] int DEFAULT 30 CHECK (duracion_minutos > 0),
    CONSTRAINT FK_Entrevista_Proyecto FOREIGN KEY (id_proyecto) 
        REFERENCES [dbo].[Proyecto] (id_proyecto),
    CONSTRAINT FK_Entrevista_Estudiante FOREIGN KEY (id_estudiante) 
        REFERENCES [dbo].[Estudiante] (id_estudiante),
    CONSTRAINT FK_Entrevista_Empresa FOREIGN KEY (id_empresa) 
        REFERENCES [dbo].[Empresa] (id_empresa)
)
GO

-- Tabla CalendarioReunion
CREATE TABLE [dbo].[CalendarioReunion] (
    [id_reunion] int PRIMARY KEY IDENTITY(1, 1),
    [id_usuario] int NOT NULL,
    [titulo] varchar(100) NOT NULL,
    [descripcion] nvarchar(MAX),
    [fecha] date NOT NULL,
    [hora_inicio] time NOT NULL,
    [hora_fin] time NOT NULL,
    [tipo] varchar(20) NOT NULL 
        CHECK (tipo IN ('entrevista', 'reunion', 'presentacion')),
    [link_reunion] varchar(255),
    CONSTRAINT FK_Calendario_Usuario FOREIGN KEY (id_usuario) 
        REFERENCES [dbo].[Usuario] (id_usuario),
    CONSTRAINT CHK_Horas_Reunion CHECK (hora_inicio < hora_fin)
)
GO

-- Tabla CuestionarioAutoevaluacion
CREATE TABLE [dbo].[CuestionarioAutoevaluacion] (
    [id_cuestionario] int PRIMARY KEY IDENTITY(1, 1),
    [id_estudiante] int NOT NULL,
    [nivel_api] varchar(1) NOT NULL,
    [preparado] bit NOT NULL,
    [comentarios] nvarchar(MAX),
    [fecha] datetime DEFAULT GETDATE(),
    CONSTRAINT FK_Cuestionario_Estudiante FOREIGN KEY (id_estudiante) 
        REFERENCES [dbo].[Estudiante] (id_estudiante),
    CONSTRAINT FK_Cuestionario_NivelAPI FOREIGN KEY (nivel_api) 
        REFERENCES [dbo].[NivelAPI] (nivel)
)
GO

-- Tabla PreguntaTRL
CREATE TABLE [dbo].[PreguntaTRL] (
    [id_pregunta] int PRIMARY KEY IDENTITY(1, 1),
    [texto_pregunta] nvarchar(MAX) NOT NULL,
    [id_padre] int,
    [tipo_respuesta] varchar(20) NOT NULL 
        CHECK (tipo_respuesta IN ('texto', 'numero', 'opcion', 'multiple')),
    [nivel_trl] int CHECK (nivel_trl BETWEEN 1 AND 9),
    CONSTRAINT FK_Pregunta_Padre FOREIGN KEY (id_padre) 
        REFERENCES [dbo].[PreguntaTRL] (id_pregunta)
)
GO

-- Tabla RespuestaTRL
CREATE TABLE [dbo].[RespuestaTRL] (
    [id_respuesta] int PRIMARY KEY IDENTITY(1, 1),
    [id_pregunta] int NOT NULL,
    [id_proyecto] int NOT NULL,
    [respuesta] nvarchar(MAX) NOT NULL,
    [fecha_respuesta] datetime DEFAULT GETDATE(),
    CONSTRAINT FK_Respuesta_Pregunta FOREIGN KEY (id_pregunta) 
        REFERENCES [dbo].[PreguntaTRL] (id_pregunta),
    CONSTRAINT FK_Respuesta_Proyecto FOREIGN KEY (id_proyecto) 
        REFERENCES [dbo].[Proyecto] (id_proyecto)
)
GO

-- Crear índices para mejorar el rendimiento
CREATE INDEX IX_Usuario_Correo ON [dbo].[Usuario] (correo);
CREATE INDEX IX_Usuario_Rol ON [dbo].[Usuario] (rol);
CREATE INDEX IX_Proyecto_Empresa ON [dbo].[Proyecto] (id_empresa);
CREATE INDEX IX_Proyecto_Estado ON [dbo].[Proyecto] (id_estado_actual);
CREATE INDEX IX_Postulacion_Estudiante ON [dbo].[Postulacion] (id_estudiante);
CREATE INDEX IX_Postulacion_Proyecto ON [dbo].[Postulacion] (id_proyecto);
CREATE INDEX IX_Notificacion_Usuario ON [dbo].[Notificacion] (id_usuario);
CREATE INDEX IX_Notificacion_Fecha ON [dbo].[Notificacion] (fecha_envio);
CREATE INDEX IX_Entrevista_Fecha ON [dbo].[Entrevista] (fecha);
GO

-- Crear trigger para actualizar fecha_modificacion en Usuario
CREATE TRIGGER TR_Usuario_Update ON [dbo].[Usuario]
AFTER UPDATE AS
BEGIN
    UPDATE [dbo].[Usuario]
    SET ultima_modificacion = GETDATE()
    FROM [dbo].[Usuario] u
    INNER JOIN inserted i ON u.id_usuario = i.id_usuario;
END
GO

-- Crear trigger para actualizar fecha_modificacion en Proyecto
CREATE TRIGGER TR_Proyecto_Update ON [dbo].[Proyecto]
AFTER UPDATE AS
BEGIN
    UPDATE [dbo].[Proyecto]
    SET ultima_modificacion = GETDATE()
    FROM [dbo].[Proyecto] p
    INNER JOIN inserted i ON p.id_proyecto = i.id_proyecto;
END
GO

-- Crear trigger para actualizar horas_totales_proyectos en PerfilEstudiante
CREATE TRIGGER TR_ExperienciaProyecto_Update ON [dbo].[ExperienciaProyecto]
AFTER INSERT, UPDATE, DELETE AS
BEGIN
    UPDATE ps
    SET horas_totales_proyectos = (
        SELECT ISNULL(SUM(horas_trabajadas), 0)
        FROM [dbo].[ExperienciaProyecto] ep
        WHERE ep.id_perfil = ps.id_perfil
    )
    FROM [dbo].[PerfilEstudiante] ps
    INNER JOIN (
        SELECT DISTINCT id_perfil FROM inserted
        UNION
        SELECT DISTINCT id_perfil FROM deleted
    ) AS changed ON ps.id_perfil = changed.id_perfil;
END
GO

-- Insertar estados de proyecto por defecto
INSERT INTO [dbo].[EstadoProyecto] (nombre, descripcion) VALUES
('Borrador', 'Proyecto en fase de creación'),
('Publicado', 'Proyecto disponible para postulaciones'),
('En Selección', 'Proyecto en proceso de selección de estudiantes'),
('En Desarrollo', 'Proyecto en ejecución'),
('Completado', 'Proyecto finalizado exitosamente'),
('Cancelado', 'Proyecto cancelado')
GO

-- Insertar niveles API por defecto
INSERT INTO [dbo].[NivelAPI] (nivel, descripcion, requisitos) VALUES
('1', 'Nivel Básico', 'Conocimientos básicos de programación y desarrollo'),
('2', 'Nivel Intermedio', 'Experiencia en desarrollo de proyectos pequeños'),
('3', 'Nivel Avanzado', 'Experiencia en desarrollo de proyectos complejos'),
('4', 'Nivel Experto', 'Experiencia en liderazgo y gestión de proyectos')
GO 