CREATE TABLE [Usuario] (
  [id_usuario] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(100) NOT NULL,
  [correo] varchar(100) UNIQUE NOT NULL,
  [contraseña] varchar(255) NOT NULL,
  [rol] varchar(20) NOT NULL,
  [estado] varchar(20) NOT NULL DEFAULT 'activo',
  [verificado] bit DEFAULT (false),
  [fecha_registro] datetime DEFAULT (GETDATE()),
  [ultima_modificacion] datetime DEFAULT (GETDATE())
)
GO

CREATE TABLE [Administrador] (
  [id_administrador] int PRIMARY KEY,
  [departamento] varchar(100) NOT NULL,
  [nivel_acceso] int NOT NULL,
  [permisos] text,
  [ultimo_acceso] datetime
)
GO

CREATE TABLE [Estudiante] (
  [id_estudiante] int PRIMARY KEY,
  [carrera] varchar(100) NOT NULL,
  [semestre] int NOT NULL,
  [estado_actividad] varchar(20) DEFAULT 'disponible',
  [strikes] int DEFAULT (0),
  [horas_acumuladas] int DEFAULT (0),
  [horas_restantes] int DEFAULT (360)
)
GO

CREATE TABLE [Empresa] (
  [id_empresa] int PRIMARY KEY,
  [nombre_empresa] varchar(100) NOT NULL,
  [rubro] varchar(100) NOT NULL,
  [descripcion] text,
  [fecha_registro] datetime DEFAULT (GETDATE())
)
GO

CREATE TABLE [Area] (
  [id_area] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(50) UNIQUE NOT NULL,
  [descripcion] text,
  [estado] bit DEFAULT (true),
  [fecha_creacion] datetime DEFAULT (GETDATE())
)
GO

CREATE TABLE [NivelAPI] (
  [id_nivel] int PRIMARY KEY IDENTITY(1, 1),
  [nivel] varchar(1) UNIQUE NOT NULL,
  [descripcion] text NOT NULL,
  [requisitos] text NOT NULL,
  [fecha_creacion] datetime DEFAULT (GETDATE())
)
GO

CREATE TABLE [EstadoProyecto] (
  [id_estado] int PRIMARY KEY IDENTITY(1, 1),
  [nombre] varchar(50) UNIQUE NOT NULL,
  [descripcion] text
)
GO

CREATE TABLE [Proyecto] (
  [id_proyecto] int PRIMARY KEY IDENTITY(1, 1),
  [id_empresa] int NOT NULL,
  [id_estado_actual] int NOT NULL,
  [id_area] int NOT NULL,
  [titulo] varchar(200) NOT NULL,
  [descripcion] text NOT NULL,
  [nivel_api_requerido] varchar(1) NOT NULL,
  [trl] int,
  [horas_requeridas] int NOT NULL,
  [fecha_publicacion] datetime DEFAULT (GETDATE()),
  [fecha_inicio] date,
  [fecha_estimada_fin] date,
  [fecha_real_fin] date,
  [ultima_modificacion] datetime DEFAULT (GETDATE())
)
GO

CREATE TABLE [HistorialEstadoProyecto] (
  [id_historial] int PRIMARY KEY IDENTITY(1, 1),
  [id_proyecto] int NOT NULL,
  [id_estado] int NOT NULL,
  [id_usuario] int NOT NULL,
  [fecha_cambio] datetime DEFAULT (GETDATE()),
  [comentario] text
)
GO

CREATE TABLE [Postulacion] (
  [id_postulacion] int PRIMARY KEY IDENTITY(1, 1),
  [id_estudiante] int NOT NULL,
  [id_proyecto] int NOT NULL,
  [fecha_postulacion] datetime DEFAULT (GETDATE()),
  [estado_postulacion] varchar(20) DEFAULT 'pendiente',
  [motivo_rechazo] text
)
GO

CREATE TABLE [Asignacion] (
  [id_asignacion] int PRIMARY KEY IDENTITY(1, 1),
  [id_postulacion] int UNIQUE NOT NULL,
  [fecha_inicio] date NOT NULL,
  [fecha_fin] date,
  [tareas] text,
  [estado] varchar(20) DEFAULT 'en curso'
)
GO

CREATE TABLE [RegistroHoras] (
  [id_registro] int PRIMARY KEY IDENTITY(1, 1),
  [id_asignacion] int NOT NULL,
  [id_estudiante] int NOT NULL,
  [id_empresa] int NOT NULL,
  [fecha_registro] date NOT NULL,
  [horas_trabajadas] int NOT NULL,
  [descripcion_actividades] text NOT NULL,
  [estado_validacion] varchar(20) DEFAULT 'pendiente',
  [fecha_validacion] datetime,
  [comentario_validacion] text,
  [id_validador] int
)
GO

CREATE TABLE [AsignacionAPI] (
  [id_asignacion] int PRIMARY KEY IDENTITY(1, 1),
  [id_estudiante] int NOT NULL,
  [id_nivel] int NOT NULL,
  [id_administrador] int NOT NULL,
  [fecha_asignacion] datetime DEFAULT (GETDATE()),
  [fecha_vencimiento] date,
  [estado] varchar(20) DEFAULT 'activo',
  [motivo] text
)
GO

CREATE TABLE [EvaluacionProyecto] (
  [id_evaluacion] int PRIMARY KEY IDENTITY(1, 1),
  [id_asignacion] int NOT NULL,
  [calificacion] int,
  [comentarios] text,
  [fecha_evaluacion] datetime DEFAULT (GETDATE())
)
GO

CREATE TABLE [Strike] (
  [id_strike] int PRIMARY KEY IDENTITY(1, 1),
  [id_estudiante] int NOT NULL,
  [motivo] text NOT NULL,
  [fecha] datetime DEFAULT (GETDATE()),
  [estado] varchar(20) DEFAULT 'activo',
  [id_administrador] int NOT NULL
)
GO

CREATE TABLE [Certificado] (
  [id_certificado] int PRIMARY KEY IDENTITY(1, 1),
  [id_estudiante] int NOT NULL,
  [nombre] varchar(100),
  [archivo_url] varchar(255),
  [fecha_subida] datetime DEFAULT (GETDATE()),
  [tipo_certificado] varchar(50) NOT NULL,
  [valido_hasta] date
)
GO

CREATE TABLE [Notificacion] (
  [id_notificacion] int PRIMARY KEY IDENTITY(1, 1),
  [id_usuario] int NOT NULL,
  [mensaje] text NOT NULL,
  [tipo] varchar(20) NOT NULL,
  [fecha_envio] datetime DEFAULT (GETDATE()),
  [leido] bit DEFAULT (false),
  [fecha_lectura] datetime
)
GO

CREATE TABLE [PerfilEstudiante] (
  [id_perfil] int PRIMARY KEY IDENTITY(1, 1),
  [id_estudiante] int UNIQUE NOT NULL,
  [horas_totales_proyectos] int DEFAULT (0),
  [experiencia_laboral] text,
  [habilidades] text,
  [portafolio_url] varchar(255),
  [biografia] text,
  [fecha_actualizacion] datetime DEFAULT (GETDATE()),
  [visibilidad] bit DEFAULT (true)
)
GO

CREATE TABLE [ExperienciaProyecto] (
  [id_experiencia] int PRIMARY KEY IDENTITY(1, 1),
  [id_perfil] int NOT NULL,
  [id_proyecto] int NOT NULL,
  [id_empresa] int NOT NULL,
  [rol_desempeñado] varchar(100) NOT NULL,
  [descripcion_tareas] text,
  [habilidades_aplicadas] text,
  [fecha_inicio] date NOT NULL,
  [fecha_fin] date,
  [horas_trabajadas] int NOT NULL,
  [calificacion_empresa] int,
  [comentarios_empresa] text,
  [fecha_registro] datetime DEFAULT (GETDATE())
)
GO

CREATE TABLE [Entrevista] (
  [id_entrevista] int PRIMARY KEY IDENTITY(1, 1),
  [id_proyecto] int NOT NULL,
  [id_estudiante] int NOT NULL,
  [id_empresa] int NOT NULL,
  [fecha] date NOT NULL,
  [hora] time NOT NULL,
  [link_reunion] varchar(255),
  [estado] varchar(20) DEFAULT 'pendiente',
  [comentarios] text,
  [duracion_minutos] int DEFAULT (30)
)
GO

CREATE TABLE [CalendarioReunion] (
  [id_reunion] int PRIMARY KEY IDENTITY(1, 1),
  [id_usuario] int NOT NULL,
  [titulo] varchar(100) NOT NULL,
  [descripcion] text,
  [fecha] date NOT NULL,
  [hora_inicio] time NOT NULL,
  [hora_fin] time NOT NULL,
  [tipo] varchar(20) NOT NULL,
  [link_reunion] varchar(255)
)
GO

CREATE TABLE [CuestionarioAutoevaluacion] (
  [id_cuestionario] int PRIMARY KEY IDENTITY(1, 1),
  [id_estudiante] int NOT NULL,
  [nivel_api] varchar(1) NOT NULL,
  [preparado] bit NOT NULL,
  [comentarios] text,
  [fecha] datetime DEFAULT (GETDATE())
)
GO

CREATE TABLE [PreguntaTRL] (
  [id_pregunta] int PRIMARY KEY IDENTITY(1, 1),
  [texto_pregunta] text NOT NULL,
  [id_padre] int,
  [tipo_respuesta] varchar(20) NOT NULL,
  [nivel_trl] int
)
GO

CREATE TABLE [RespuestaTRL] (
  [id_respuesta] int PRIMARY KEY IDENTITY(1, 1),
  [id_pregunta] int NOT NULL,
  [id_proyecto] int NOT NULL,
  [respuesta] text NOT NULL,
  [fecha_respuesta] datetime DEFAULT (GETDATE())
)
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'estudiante, empresa, admin',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Usuario',
@level2type = N'Column', @level2name = 'rol';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'activo, inactivo',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Usuario',
@level2type = N'Column', @level2name = 'estado';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '1-5',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Administrador',
@level2type = N'Column', @level2name = 'nivel_acceso';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '1-12',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Estudiante',
@level2type = N'Column', @level2name = 'semestre';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'disponible, ocupado, inactivo',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Estudiante',
@level2type = N'Column', @level2name = 'estado_actividad';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '>= 0',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Estudiante',
@level2type = N'Column', @level2name = 'strikes';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '>= 0, <= 360',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Estudiante',
@level2type = N'Column', @level2name = 'horas_acumuladas';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '>= 0, <= 360',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Estudiante',
@level2type = N'Column', @level2name = 'horas_restantes';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'activo/inactivo',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Area',
@level2type = N'Column', @level2name = 'estado';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '1,2,3,4',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'NivelAPI',
@level2type = N'Column', @level2name = 'nivel';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '1-9',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Proyecto',
@level2type = N'Column', @level2name = 'trl';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '> 0',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Proyecto',
@level2type = N'Column', @level2name = 'horas_requeridas';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'pendiente, aceptada, rechazada, cancelada',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Postulacion',
@level2type = N'Column', @level2name = 'estado_postulacion';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'en curso, completado, cancelado',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Asignacion',
@level2type = N'Column', @level2name = 'estado';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '> 0',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'RegistroHoras',
@level2type = N'Column', @level2name = 'horas_trabajadas';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'pendiente, aprobado, rechazado',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'RegistroHoras',
@level2type = N'Column', @level2name = 'estado_validacion';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'activo, vencido, revocado',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'AsignacionAPI',
@level2type = N'Column', @level2name = 'estado';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '1-5',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'EvaluacionProyecto',
@level2type = N'Column', @level2name = 'calificacion';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'activo, resuelto, anulado',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Strike',
@level2type = N'Column', @level2name = 'estado';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'sistema, proyecto, postulacion, evaluacion, horas',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Notificacion',
@level2type = N'Column', @level2name = 'tipo';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '>= 0',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'PerfilEstudiante',
@level2type = N'Column', @level2name = 'horas_totales_proyectos';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '> 0',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'ExperienciaProyecto',
@level2type = N'Column', @level2name = 'horas_trabajadas';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '1-5',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'ExperienciaProyecto',
@level2type = N'Column', @level2name = 'calificacion_empresa';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'pendiente, confirmada, realizada, cancelada',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Entrevista',
@level2type = N'Column', @level2name = 'estado';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '> 0',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'Entrevista',
@level2type = N'Column', @level2name = 'duracion_minutos';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'entrevista, reunion, presentacion',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'CalendarioReunion',
@level2type = N'Column', @level2name = 'tipo';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'texto, numero, opcion, multiple',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'PreguntaTRL',
@level2type = N'Column', @level2name = 'tipo_respuesta';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '1-9',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'PreguntaTRL',
@level2type = N'Column', @level2name = 'nivel_trl';
GO

ALTER TABLE [Administrador] ADD FOREIGN KEY ([id_administrador]) REFERENCES [Usuario] ([id_usuario])
GO

ALTER TABLE [Estudiante] ADD FOREIGN KEY ([id_estudiante]) REFERENCES [Usuario] ([id_usuario])
GO

ALTER TABLE [Empresa] ADD FOREIGN KEY ([id_empresa]) REFERENCES [Usuario] ([id_usuario])
GO

ALTER TABLE [Proyecto] ADD FOREIGN KEY ([id_empresa]) REFERENCES [Empresa] ([id_empresa])
GO

ALTER TABLE [Proyecto] ADD FOREIGN KEY ([id_estado_actual]) REFERENCES [EstadoProyecto] ([id_estado])
GO

ALTER TABLE [Proyecto] ADD FOREIGN KEY ([id_area]) REFERENCES [Area] ([id_area])
GO

ALTER TABLE [Proyecto] ADD FOREIGN KEY ([nivel_api_requerido]) REFERENCES [NivelAPI] ([nivel])
GO

ALTER TABLE [HistorialEstadoProyecto] ADD FOREIGN KEY ([id_proyecto]) REFERENCES [Proyecto] ([id_proyecto])
GO

ALTER TABLE [HistorialEstadoProyecto] ADD FOREIGN KEY ([id_estado]) REFERENCES [EstadoProyecto] ([id_estado])
GO

ALTER TABLE [HistorialEstadoProyecto] ADD FOREIGN KEY ([id_usuario]) REFERENCES [Usuario] ([id_usuario])
GO

ALTER TABLE [Postulacion] ADD FOREIGN KEY ([id_estudiante]) REFERENCES [Estudiante] ([id_estudiante])
GO

ALTER TABLE [Postulacion] ADD FOREIGN KEY ([id_proyecto]) REFERENCES [Proyecto] ([id_proyecto])
GO

ALTER TABLE [Asignacion] ADD FOREIGN KEY ([id_postulacion]) REFERENCES [Postulacion] ([id_postulacion])
GO

ALTER TABLE [RegistroHoras] ADD FOREIGN KEY ([id_asignacion]) REFERENCES [Asignacion] ([id_asignacion])
GO

ALTER TABLE [RegistroHoras] ADD FOREIGN KEY ([id_estudiante]) REFERENCES [Estudiante] ([id_estudiante])
GO

ALTER TABLE [RegistroHoras] ADD FOREIGN KEY ([id_empresa]) REFERENCES [Empresa] ([id_empresa])
GO

ALTER TABLE [RegistroHoras] ADD FOREIGN KEY ([id_validador]) REFERENCES [Usuario] ([id_usuario])
GO

ALTER TABLE [AsignacionAPI] ADD FOREIGN KEY ([id_estudiante]) REFERENCES [Estudiante] ([id_estudiante])
GO

ALTER TABLE [AsignacionAPI] ADD FOREIGN KEY ([id_nivel]) REFERENCES [NivelAPI] ([id_nivel])
GO

ALTER TABLE [AsignacionAPI] ADD FOREIGN KEY ([id_administrador]) REFERENCES [Administrador] ([id_administrador])
GO

ALTER TABLE [EvaluacionProyecto] ADD FOREIGN KEY ([id_asignacion]) REFERENCES [Asignacion] ([id_asignacion])
GO

ALTER TABLE [Strike] ADD FOREIGN KEY ([id_estudiante]) REFERENCES [Estudiante] ([id_estudiante])
GO

ALTER TABLE [Strike] ADD FOREIGN KEY ([id_administrador]) REFERENCES [Administrador] ([id_administrador])
GO

ALTER TABLE [Certificado] ADD FOREIGN KEY ([id_estudiante]) REFERENCES [Estudiante] ([id_estudiante])
GO

ALTER TABLE [Notificacion] ADD FOREIGN KEY ([id_usuario]) REFERENCES [Usuario] ([id_usuario])
GO

ALTER TABLE [PerfilEstudiante] ADD FOREIGN KEY ([id_estudiante]) REFERENCES [Estudiante] ([id_estudiante])
GO

ALTER TABLE [ExperienciaProyecto] ADD FOREIGN KEY ([id_perfil]) REFERENCES [PerfilEstudiante] ([id_perfil])
GO

ALTER TABLE [ExperienciaProyecto] ADD FOREIGN KEY ([id_proyecto]) REFERENCES [Proyecto] ([id_proyecto])
GO

ALTER TABLE [ExperienciaProyecto] ADD FOREIGN KEY ([id_empresa]) REFERENCES [Empresa] ([id_empresa])
GO

ALTER TABLE [Entrevista] ADD FOREIGN KEY ([id_proyecto]) REFERENCES [Proyecto] ([id_proyecto])
GO

ALTER TABLE [Entrevista] ADD FOREIGN KEY ([id_estudiante]) REFERENCES [Estudiante] ([id_estudiante])
GO

ALTER TABLE [Entrevista] ADD FOREIGN KEY ([id_empresa]) REFERENCES [Empresa] ([id_empresa])
GO

ALTER TABLE [CalendarioReunion] ADD FOREIGN KEY ([id_usuario]) REFERENCES [Usuario] ([id_usuario])
GO

ALTER TABLE [CuestionarioAutoevaluacion] ADD FOREIGN KEY ([id_estudiante]) REFERENCES [Estudiante] ([id_estudiante])
GO

ALTER TABLE [CuestionarioAutoevaluacion] ADD FOREIGN KEY ([nivel_api]) REFERENCES [NivelAPI] ([nivel])
GO

ALTER TABLE [PreguntaTRL] ADD FOREIGN KEY ([id_padre]) REFERENCES [PreguntaTRL] ([id_pregunta])
GO

ALTER TABLE [RespuestaTRL] ADD FOREIGN KEY ([id_pregunta]) REFERENCES [PreguntaTRL] ([id_pregunta])
GO

ALTER TABLE [RespuestaTRL] ADD FOREIGN KEY ([id_proyecto]) REFERENCES [Proyecto] ([id_proyecto])
GO

ALTER TABLE [Proyecto] ADD FOREIGN KEY ([id_proyecto]) REFERENCES [Proyecto] ([fecha_real_fin])
GO
