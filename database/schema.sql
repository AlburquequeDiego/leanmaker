-- =====================================================
-- ESQUEMA DE BASE DE DATOS - LEANMAKER (VERSIÓN CORREGIDA)
-- SQL Server
-- Optimizado para rendimiento y integridad de datos
-- =====================================================

USE leanmaker_db;
GO
 -- 1. Asegurarse de que estamos operando en la base de datos correcta
USE leanmaker_db;
GO

-- 2. Crear un usuario de base de datos vinculado al login 'admintesis'.
--    Si el usuario ya existe en la base de datos, este comando dará un error
--    que puedes ignorar sin problemas.
CREATE USER admintesis FOR LOGIN admintesis;
GO

-- 3. Darle al usuario todos los permisos sobre la base de datos 'leanmaker_db'.
--    Este es el paso más importante.
ALTER ROLE db_owner ADD MEMBER admintesis;
GO



-- =====================================================
-- ELIMINAR TABLAS EXISTENTES (EN ORDEN INVERSO DE DEPENDENCIAS)
-- Esto permite que el script se pueda ejecutar múltiples veces.
-- =====================================================
DROP TABLE IF EXISTS data_backups;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS platform_config;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS notification_preferences;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS calendar_events;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS disciplinary_records;
DROP TABLE IF EXISTS mass_notifications;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS strikes;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS evaluation_categories;
DROP TABLE IF EXISTS evaluations;
DROP TABLE IF EXISTS work_hours;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS project_status_history;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS project_status;
DROP TABLE IF EXISTS areas;
DROP TABLE IF EXISTS trl_levels;
GO

-- =====================================================
-- TABLAS DE CONFIGURACIÓN (DEBEN IR PRIMERO)
-- =====================================================

-- Tabla de niveles TRL
CREATE TABLE trl_levels (
    id INT IDENTITY(1,1) PRIMARY KEY,
    level INT UNIQUE NOT NULL CHECK (level BETWEEN 1 AND 9),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Tabla de áreas de conocimiento
CREATE TABLE areas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) UNIQUE NOT NULL,
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Tabla de estados de proyecto
CREATE TABLE project_status (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) UNIQUE NOT NULL,
    description NVARCHAR(MAX),
    color NVARCHAR(7) DEFAULT '#007bff',
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(254) UNIQUE NOT NULL,
    password NVARCHAR(128) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student', 'company')),
    name NVARCHAR(200) NOT NULL,
    is_active BIT DEFAULT 1,
    is_staff BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_users_email_format CHECK (email LIKE '%_@__%.__%'),
    CONSTRAINT CK_users_name_length CHECK (LEN(name) >= 2),
    CONSTRAINT CK_users_password_length CHECK (LEN(password) >= 8)
);

-- Tabla de administradores
CREATE TABLE admins (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    permissions NVARCHAR(MAX), -- JSON array de permisos
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE EMPRESAS
-- =====================================================
CREATE TABLE companies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    industry NVARCHAR(100),
    size NVARCHAR(50) CHECK (size IN ('Pequeña', 'Mediana', 'Grande', 'Startup')),
    website NVARCHAR(200),
    address NVARCHAR(MAX),
    city NVARCHAR(100),
    country NVARCHAR(100),
    founded_year INT CHECK (founded_year >= 1900 AND founded_year <= YEAR(GETDATE())),
    logo_url NVARCHAR(500),
    verified BIT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_projects INT DEFAULT 0 CHECK (total_projects >= 0),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_companies_name_length CHECK (LEN(company_name) >= 2),
    CONSTRAINT CK_companies_website_format CHECK (website IS NULL OR website LIKE 'http%')
);

-- =====================================================
-- TABLA DE ESTUDIANTES
-- =====================================================
CREATE TABLE students (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    career NVARCHAR(200),
    semester INT CHECK (semester >= 1 AND semester <= 12),
    graduation_year INT CHECK (graduation_year >= YEAR(GETDATE()) AND graduation_year <= YEAR(GETDATE()) + 10),
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    api_level INT DEFAULT 1 CHECK (api_level BETWEEN 1 AND 4),
    strikes INT DEFAULT 0 CHECK (strikes >= 0 AND strikes <= 10),
    gpa DECIMAL(3,2) DEFAULT 0 CHECK (gpa >= 0 AND gpa <= 7),
    completed_projects INT DEFAULT 0 CHECK (completed_projects >= 0),
    total_hours INT DEFAULT 0 CHECK (total_hours >= 0),
    skills NVARCHAR(MAX), -- JSON array de habilidades
    experience_years INT DEFAULT 0 CHECK (experience_years >= 0 AND experience_years <= 20),
    portfolio_url NVARCHAR(500),
    github_url NVARCHAR(500),
    linkedin_url NVARCHAR(500),
    availability NVARCHAR(20) DEFAULT 'flexible' CHECK (availability IN ('full-time', 'part-time', 'flexible')),
    location NVARCHAR(200),
    languages NVARCHAR(MAX), -- JSON array de idiomas
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_students_portfolio_url CHECK (portfolio_url IS NULL OR portfolio_url LIKE 'http%'),
    CONSTRAINT CK_students_github_url CHECK (github_url IS NULL OR github_url LIKE 'http%'),
    CONSTRAINT CK_students_linkedin_url CHECK (linkedin_url IS NULL OR linkedin_url LIKE 'http%')
);

-- =====================================================
-- TABLA DE PROYECTOS
-- =====================================================
CREATE TABLE projects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE NO ACTION,
    status_id INT FOREIGN KEY REFERENCES project_status(id),
    area_id INT FOREIGN KEY REFERENCES areas(id),
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    trl_id INT FOREIGN KEY REFERENCES trl_levels(id),
    api_level INT CHECK (api_level BETWEEN 1 AND 4),
    required_hours INT CHECK (required_hours > 0),
    start_date DATE,
    estimated_end_date DATE,
    real_end_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE project_status_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    status_id INT FOREIGN KEY REFERENCES project_status(id),
    user_id INT FOREIGN KEY REFERENCES users(id),
    fecha_cambio DATETIME2 DEFAULT GETDATE(),
    comentario NVARCHAR(MAX)
);

-- =====================================================
-- TABLA DE POSTULACIONES Y ASIGNACIONES
-- =====================================================
CREATE TABLE applications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE NO ACTION,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    fecha_postulacion DATETIME2 DEFAULT GETDATE(),
    motivo_rechazo NVARCHAR(MAX)
);

CREATE TABLE assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT UNIQUE FOREIGN KEY REFERENCES applications(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    tareas NVARCHAR(MAX),
    estado NVARCHAR(20) DEFAULT 'en curso' CHECK (estado IN ('en curso', 'completado', 'cancelado'))
);

-- =====================================================
-- TABLA DE HORAS Y VALIDACIONES (UNA SOLA VEZ)
-- =====================================================
CREATE TABLE work_hours (
    id INT IDENTITY(1,1) PRIMARY KEY,
    assignment_id INT FOREIGN KEY REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE NO ACTION,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE NO ACTION,
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE NO ACTION,
    fecha DATE NOT NULL,
    horas_trabajadas INT CHECK (horas_trabajadas > 0),
    descripcion NVARCHAR(MAX),
    estado_validacion NVARCHAR(20) DEFAULT 'pendiente' CHECK (estado_validacion IN ('pendiente', 'aprobado', 'rechazado')),
    validador_id INT FOREIGN KEY REFERENCES users(id),
    fecha_validacion DATETIME2,
    comentario_validacion NVARCHAR(MAX)
);

-- =====================================================
-- TABLA DE EVALUACIONES
-- =====================================================
CREATE TABLE evaluations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE NO ACTION,
    evaluator_id INT FOREIGN KEY REFERENCES users(id),
    type NVARCHAR(20) DEFAULT 'final' CHECK (type IN ('intermediate', 'final')),
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    overall_rating DECIMAL(3,2) CHECK (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 5)),
    comments NVARCHAR(MAX),
    strengths NVARCHAR(MAX), -- JSON array
    areas_for_improvement NVARCHAR(MAX), -- JSON array
    due_date DATE CHECK (due_date >= GETDATE()),
    completed_date DATE,
    project_duration NVARCHAR(100),
    technologies NVARCHAR(MAX), -- JSON array
    deliverables NVARCHAR(MAX), -- JSON array
    evaluator_role NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_evaluations_unique_project_student UNIQUE (project_id, student_id, type),
    CONSTRAINT CK_evaluations_completed_date_logic CHECK (completed_date IS NULL OR completed_date >= created_at),
    CONSTRAINT CK_evaluations_rating_when_completed CHECK (status != 'completed' OR overall_rating IS NOT NULL)
);

-- =====================================================
-- TABLA DE CATEGORÍAS DE EVALUACIÓN
-- =====================================================
CREATE TABLE evaluation_categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    evaluation_id INT FOREIGN KEY REFERENCES evaluations(id) ON DELETE CASCADE,
    category_name NVARCHAR(100) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_evaluation_categories_rating CHECK (rating BETWEEN 1 AND 5)
);

-- =====================================================
-- TABLA DE CALIFICACIONES MUTUAS
-- =====================================================
CREATE TABLE ratings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    rater_id INT FOREIGN KEY REFERENCES users(id) ON DELETE NO ACTION,
    rated_id INT FOREIGN KEY REFERENCES users(id) ON DELETE NO ACTION,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    rating DECIMAL(3,2) CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    category NVARCHAR(50) DEFAULT 'overall' CHECK (category IN ('overall', 'technical', 'communication', 'punctuality', 'quality')),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_ratings_unique_rating UNIQUE (rater_id, rated_id, project_id, category)
);

-- =====================================================
-- TABLA DE STRIKES
-- =====================================================
CREATE TABLE strikes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE NO ACTION,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE SET NULL,
    assigned_by INT FOREIGN KEY REFERENCES users(id),
    reason NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'appealed', 'resolved')),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    title NVARCHAR(200) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BIT DEFAULT 0,
    related_url NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_notifications_title_length CHECK (LEN(title) >= 2),
    CONSTRAINT CK_notifications_message_length CHECK (LEN(message) >= 5)
);

-- =====================================================
-- TABLA DE NOTIFICACIONES MASIVAS
-- =====================================================
CREATE TABLE mass_notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    target_role NVARCHAR(20) CHECK (target_role IN ('all', 'student', 'company', 'admin')),
    sent_by INT FOREIGN KEY REFERENCES users(id),
    sent_at DATETIME2 DEFAULT GETDATE(),
    recipients_count INT DEFAULT 0,
    
    -- Constraints adicionales
    CONSTRAINT CK_mass_notifications_title_length CHECK (LEN(title) >= 2),
    CONSTRAINT CK_mass_notifications_message_length CHECK (LEN(message) >= 5)
);

-- =====================================================
-- TABLA DE REGISTRO DISCIPLINARIO
-- =====================================================
CREATE TABLE disciplinary_records (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('strike', 'warning', 'commendation', 'suspension')),
    reason NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    assigned_by NVARCHAR(200),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE ENTREVISTAS
-- =====================================================
CREATE TABLE interviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT UNIQUE FOREIGN KEY REFERENCES applications(id) ON DELETE CASCADE,
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE NO ACTION,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE NO ACTION,
    interviewer_id INT FOREIGN KEY REFERENCES users(id),
    type NVARCHAR(20) DEFAULT 'technical' CHECK (type IN ('technical', 'behavioral', 'cultural', 'final')),
    status NVARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    scheduled_date DATETIME2 NOT NULL,
    duration_minutes INT DEFAULT 60 CHECK (duration_minutes BETWEEN 15 AND 480),
    location NVARCHAR(200),
    meeting_url NVARCHAR(500),
    notes NVARCHAR(MAX),
    feedback NVARCHAR(MAX),
    rating DECIMAL(3,2) CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_interviews_scheduled_date CHECK (scheduled_date > GETDATE()),
    CONSTRAINT CK_interviews_meeting_url CHECK (meeting_url IS NULL OR meeting_url LIKE 'http%')
);

-- =====================================================
-- TABLA DE EVENTOS DE CALENDARIO
-- =====================================================
CREATE TABLE calendar_events (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE NO ACTION,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE NO ACTION,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE NO ACTION,
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE NO ACTION,
    interview_id INT FOREIGN KEY REFERENCES interviews(id) ON DELETE SET NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    start_time DATETIME2 NOT NULL,
    end_time DATETIME2 NOT NULL,
    is_all_day BIT DEFAULT 0,
    event_type NVARCHAR(50) DEFAULT 'general',
    location NVARCHAR(200),
    meeting_url NVARCHAR(500),
    created_by INT FOREIGN KEY REFERENCES users(id),
    status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    
    -- Constraints
    CONSTRAINT CK_calendar_events_end_time CHECK (end_time >= start_time)
);

-- =====================================================
-- TABLA DE DOCUMENTOS Y ARCHIVOS
-- =====================================================
CREATE TABLE documents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE SET NULL,
    type NVARCHAR(50) NOT NULL CHECK (type IN ('cv', 'portfolio', 'certificate', 'project_deliverable', 'evaluation_report', 'contract', 'other')),
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    file_path NVARCHAR(500) NOT NULL,
    file_size INT CHECK (file_size > 0),
    mime_type NVARCHAR(100),
    is_public BIT DEFAULT 0,
    is_verified BIT DEFAULT 0,
    uploaded_at DATETIME2 DEFAULT GETDATE(),
    verified_at DATETIME2,
    verified_by INT FOREIGN KEY REFERENCES users(id),
    
    -- Constraints adicionales
    CONSTRAINT CK_documents_file_path CHECK (file_path LIKE '%.%'),
    CONSTRAINT CK_documents_title_length CHECK (LEN(title) >= 2)
);

-- =====================================================
-- TABLA DE CONFIGURACIÓN DE NOTIFICACIONES
-- =====================================================
CREATE TABLE notification_preferences (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BIT DEFAULT 1,
    push_notifications BIT DEFAULT 1,
    project_updates BIT DEFAULT 1,
    evaluation_reminders BIT DEFAULT 1,
    deadline_alerts BIT DEFAULT 1,
    new_projects BIT DEFAULT 1,
    system_announcements BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE LOGS DE ACTIVIDAD
-- =====================================================
CREATE TABLE activity_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE SET NULL,
    action NVARCHAR(100) NOT NULL,
    entity_type NVARCHAR(50),
    entity_id INT,
    details NVARCHAR(MAX),
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_activity_logs_action_length CHECK (LEN(action) >= 2)
);

-- =====================================================
-- TABLA DE CONFIGURACIÓN DE PLATAFORMA
-- =====================================================
CREATE TABLE platform_config (
    id INT IDENTITY(1,1) PRIMARY KEY,
    config_key NVARCHAR(100) UNIQUE NOT NULL,
    config_value NVARCHAR(MAX),
    config_type NVARCHAR(20) DEFAULT 'string' CHECK (config_type IN ('string', 'integer', 'boolean', 'json')),
    description NVARCHAR(500),
    is_public BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_platform_config_key_length CHECK (LEN(config_key) >= 2)
);

-- =====================================================
-- TABLA DE REPORTES Y ESTADÍSTICAS
-- =====================================================
CREATE TABLE reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE SET NULL,
    report_type NVARCHAR(50) NOT NULL CHECK (report_type IN ('student_performance', 'project_analytics', 'company_metrics', 'platform_stats', 'financial_report')),
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    data NVARCHAR(MAX), -- JSON con los datos del reporte
    file_path NVARCHAR(500),
    generated_at DATETIME2 DEFAULT GETDATE(),
    expires_at DATETIME2,
    is_public BIT DEFAULT 0,
    
    -- Constraints adicionales
    CONSTRAINT CK_reports_title_length CHECK (LEN(title) >= 2)
);

-- =====================================================
-- TABLA DE BACKUP Y VERSIONADO
-- =====================================================
CREATE TABLE data_backups (
    id INT IDENTITY(1,1) PRIMARY KEY,
    backup_type NVARCHAR(50) NOT NULL CHECK (backup_type IN ('full', 'incremental', 'schema_only')),
    file_path NVARCHAR(500) NOT NULL,
    file_size BIGINT CHECK (file_size > 0),
    checksum NVARCHAR(64),
    created_by INT FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 DEFAULT GETDATE(),
    status NVARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    notes NVARCHAR(MAX)
);

-- =====================================================
-- INSERTS INICIALES PARA CONFIGURACIÓN
-- =====================================================

-- Niveles TRL
INSERT INTO trl_levels (level, name, description) VALUES
(1, 'TRL 1 - Principios Básicos', 'Investigación científica básica observada y reportada'),
(2, 'TRL 2 - Concepto Tecnológico', 'Invención tecnológica reportada'),
(3, 'TRL 3 - Prueba de Concepto', 'Prueba analítica y experimental de concepto crítico'),
(4, 'TRL 4 - Validación en Laboratorio', 'Validación en entorno de laboratorio'),
(5, 'TRL 5 - Validación en Entorno Relevante', 'Validación en entorno relevante'),
(6, 'TRL 6 - Demostración en Entorno Relevante', 'Demostración en entorno relevante'),
(7, 'TRL 7 - Demostración en Entorno Operacional', 'Demostración en entorno operacional'),
(8, 'TRL 8 - Sistema Completo Cualificado', 'Sistema completo calificado a través de pruebas'),
(9, 'TRL 9 - Sistema Completo Probado', 'Sistema completo probado a través de operaciones exitosas');

-- Áreas de conocimiento
INSERT INTO areas (name, description) VALUES
('Desarrollo Web', 'Desarrollo de aplicaciones web y sitios web'),
('Desarrollo Móvil', 'Desarrollo de aplicaciones móviles'),
('Inteligencia Artificial', 'Machine Learning, Deep Learning, IA'),
('Ciencia de Datos', 'Análisis de datos, Big Data, Analytics'),
('DevOps', 'Desarrollo y operaciones, CI/CD'),
('Ciberseguridad', 'Seguridad informática y protección de datos'),
('Cloud Computing', 'Computación en la nube y servicios web'),
('Blockchain', 'Tecnología blockchain y criptomonedas'),
('IoT', 'Internet de las Cosas'),
('Realidad Virtual/Aumentada', 'VR/AR y tecnologías inmersivas');

-- Estados de proyecto
INSERT INTO project_status (name, description, color) VALUES
('draft', 'Borrador - Proyecto en creación', '#6c757d'),
('open', 'Abierto - Aceptando postulaciones', '#28a745'),
('in-progress', 'En Progreso - Proyecto activo', '#007bff'),
('paused', 'Pausado - Proyecto temporalmente detenido', '#ffc107'),
('completed', 'Completado - Proyecto finalizado', '#17a2b8'),
('cancelled', 'Cancelado - Proyecto cancelado', '#dc3545');

-- Configuración de plataforma
INSERT INTO platform_config (config_key, config_value, config_type, description, is_public) VALUES
('max_file_size_mb', '10', 'integer', 'Tamaño máximo de archivo en MB', 1),
('allowed_file_types', '["pdf", "doc", "docx", "jpg", "png", "zip"]', 'json', 'Tipos de archivo permitidos', 1),
('max_projects_per_student', '3', 'integer', 'Máximo número de proyectos simultáneos por estudiante', 1),
('min_gpa_requirement', '5.0', 'string', 'GPA mínimo requerido para estudiantes', 1),
('strike_threshold', '3', 'integer', 'Número de strikes antes de suspensión', 0),
('evaluation_due_days', '7', 'integer', 'Días para completar evaluación después de proyecto', 1),
('auto_approve_hours', 'false', 'boolean', 'Aprobar horas automáticamente', 0),
('maintenance_mode', 'false', 'boolean', 'Modo mantenimiento de la plataforma', 1),
('email_notifications_enabled', 'true', 'boolean', 'Habilitar notificaciones por email', 0),
('max_api_level', '4', 'integer', 'Nivel máximo de API para proyectos', 1);

-- =====================================================
-- FIN DEL ESQUEMA CORREGIDO
-- =====================================================

PRINT 'Esquema de base de datos CORREGIDO creado exitosamente!';
PRINT 'Base de datos: leanmaker_db';
PRINT 'Tablas creadas: 25';
PRINT 'Constraints adicionales: 60+';
PRINT 'Datos iniciales insertados'; 



