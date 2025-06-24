-- =====================================================
-- ESQUEMA UNIFICADO DE BASE DE DATOS - LEANMAKER
-- SQL Server - Optimizado para Django ORM
-- Versión consolidada y corregida
-- =====================================================

USE leanmaker_db;
GO

-- =====================================================
-- CONFIGURACIÓN DE USUARIO (OPCIONAL)
-- =====================================================
-- Crear usuario si no existe (ignorar error si ya existe)
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'admintesis')
BEGIN
    CREATE USER admintesis FOR LOGIN admintesis;
    ALTER ROLE db_owner ADD MEMBER admintesis;
END
GO

-- =====================================================
-- ELIMINACIÓN COMPLETA DE OBJETOS EXISTENTES
-- =====================================================
PRINT 'Eliminando objetos existentes...';

-- Deshabilitar restricciones de clave foránea temporalmente
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT ALL";
PRINT 'Restricciones de clave foránea deshabilitadas.';

-- Eliminar vistas primero (dependen de tablas)
IF OBJECT_ID('v_student_stats', 'V') IS NOT NULL DROP VIEW v_student_stats;
IF OBJECT_ID('v_company_stats', 'V') IS NOT NULL DROP VIEW v_company_stats;
IF OBJECT_ID('v_project_stats', 'V') IS NOT NULL DROP VIEW v_project_stats;
IF OBJECT_ID('v_evaluations_complete', 'V') IS NOT NULL DROP VIEW v_evaluations_complete;
IF OBJECT_ID('v_admin_dashboard', 'V') IS NOT NULL DROP VIEW v_admin_dashboard;
GO

-- Eliminar procedimientos almacenados si existen
IF OBJECT_ID('sp_UpdateProjectStats', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateProjectStats;
IF OBJECT_ID('sp_AssignStrike', 'P') IS NOT NULL DROP PROCEDURE sp_AssignStrike;
IF OBJECT_ID('sp_CreateNotification', 'P') IS NOT NULL DROP PROCEDURE sp_CreateNotification;
IF OBJECT_ID('sp_ApproveWorkHours', 'P') IS NOT NULL DROP PROCEDURE sp_ApproveWorkHours;
IF OBJECT_ID('sp_CompleteProject', 'P') IS NOT NULL DROP PROCEDURE sp_CompleteProject;
GO

-- Eliminar triggers si existen
IF OBJECT_ID('tr_UpdateStudentStats', 'TR') IS NOT NULL DROP TRIGGER tr_UpdateStudentStats;
IF OBJECT_ID('tr_UpdateCompanyStats', 'TR') IS NOT NULL DROP TRIGGER tr_UpdateCompanyStats;
IF OBJECT_ID('tr_UpdateProjectStats', 'TR') IS NOT NULL DROP TRIGGER tr_UpdateProjectStats;
GO

-- Eliminar funciones si existen
IF OBJECT_ID('fn_CalculateStudentRating', 'FN') IS NOT NULL DROP FUNCTION fn_CalculateStudentRating;
IF OBJECT_ID('fn_CalculateProjectProgress', 'FN') IS NOT NULL DROP FUNCTION fn_CalculateProjectProgress;
GO

-- Eliminar tablas en orden inverso de dependencias (sin restricciones FK)
-- Tablas de datos y logs
IF OBJECT_ID('data_backups', 'U') IS NOT NULL DROP TABLE data_backups;
IF OBJECT_ID('reports', 'U') IS NOT NULL DROP TABLE reports;
IF OBJECT_ID('platform_config', 'U') IS NOT NULL DROP TABLE platform_config;
IF OBJECT_ID('activity_logs', 'U') IS NOT NULL DROP TABLE activity_logs;
IF OBJECT_ID('notification_preferences', 'U') IS NOT NULL DROP TABLE notification_preferences;
IF OBJECT_ID('documents', 'U') IS NOT NULL DROP TABLE documents;
IF OBJECT_ID('calendar_events', 'U') IS NOT NULL DROP TABLE calendar_events;
IF OBJECT_ID('interviews', 'U') IS NOT NULL DROP TABLE interviews;
IF OBJECT_ID('disciplinary_records', 'U') IS NOT NULL DROP TABLE disciplinary_records;
IF OBJECT_ID('mass_notifications', 'U') IS NOT NULL DROP TABLE mass_notifications;
IF OBJECT_ID('notifications', 'U') IS NOT NULL DROP TABLE notifications;
IF OBJECT_ID('strikes', 'U') IS NOT NULL DROP TABLE strikes;
IF OBJECT_ID('ratings', 'U') IS NOT NULL DROP TABLE ratings;
IF OBJECT_ID('evaluations', 'U') IS NOT NULL DROP TABLE evaluations;
IF OBJECT_ID('evaluation_categories', 'U') IS NOT NULL DROP TABLE evaluation_categories;
IF OBJECT_ID('work_hours', 'U') IS NOT NULL DROP TABLE work_hours;
IF OBJECT_ID('assignments', 'U') IS NOT NULL DROP TABLE assignments;
IF OBJECT_ID('applications', 'U') IS NOT NULL DROP TABLE applications;
IF OBJECT_ID('project_status_history', 'U') IS NOT NULL DROP TABLE project_status_history;
IF OBJECT_ID('projects', 'U') IS NOT NULL DROP TABLE projects;
IF OBJECT_ID('students', 'U') IS NOT NULL DROP TABLE students;
IF OBJECT_ID('companies', 'U') IS NOT NULL DROP TABLE companies;
IF OBJECT_ID('admins', 'U') IS NOT NULL DROP TABLE admins;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
IF OBJECT_ID('project_status', 'U') IS NOT NULL DROP TABLE project_status;
IF OBJECT_ID('areas', 'U') IS NOT NULL DROP TABLE areas;
IF OBJECT_ID('trl_levels', 'U') IS NOT NULL DROP TABLE trl_levels;
GO

-- Eliminar secuencias si existen (por si acaso)
IF OBJECT_ID('seq_user_id', 'SO') IS NOT NULL DROP SEQUENCE seq_user_id;
IF OBJECT_ID('seq_project_id', 'SO') IS NOT NULL DROP SEQUENCE seq_project_id;
IF OBJECT_ID('seq_student_id', 'SO') IS NOT NULL DROP SEQUENCE seq_student_id;
IF OBJECT_ID('seq_company_id', 'SO') IS NOT NULL DROP SEQUENCE seq_company_id;
GO

-- Habilitar restricciones de clave foránea nuevamente
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL";
PRINT 'Restricciones de clave foránea habilitadas nuevamente.';

PRINT 'Objetos existentes eliminados correctamente.';
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

-- =====================================================
-- TABLA DE HISTORIAL DE ESTADOS DE PROYECTO
-- =====================================================
CREATE TABLE project_status_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    status_id INT FOREIGN KEY REFERENCES project_status(id),
    user_id INT FOREIGN KEY REFERENCES users(id),
    fecha_cambio DATETIME2 DEFAULT GETDATE(),
    comentario NVARCHAR(MAX)
);

-- =====================================================
-- TABLA DE POSTULACIONES
-- =====================================================
CREATE TABLE applications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE NO ACTION,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    fecha_postulacion DATETIME2 DEFAULT GETDATE(),
    motivo_rechazo NVARCHAR(MAX)
);

-- =====================================================
-- TABLA DE ASIGNACIONES
-- =====================================================
CREATE TABLE assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT UNIQUE FOREIGN KEY REFERENCES applications(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    tareas NVARCHAR(MAX),
    estado NVARCHAR(20) DEFAULT 'en curso' CHECK (estado IN ('en curso', 'completado', 'cancelado'))
);

-- =====================================================
-- TABLA DE HORAS TRABAJADAS
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
-- TABLA DE CATEGORÍAS DE EVALUACIÓN
-- =====================================================
CREATE TABLE evaluation_categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    weight DECIMAL(3,2) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE EVALUACIONES
-- =====================================================
CREATE TABLE evaluations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INT FOREIGN KEY REFERENCES users(id),
    category_id INT FOREIGN KEY REFERENCES evaluation_categories(id),
    score DECIMAL(3,2) CHECK (score >= 0 AND score <= 10),
    comments NVARCHAR(MAX),
    evaluation_date DATETIME2 DEFAULT GETDATE(),
    
    -- Una evaluación por estudiante, proyecto y categoría
    CONSTRAINT UQ_evaluation_student_project_category UNIQUE (student_id, project_id, category_id)
);

-- =====================================================
-- TABLA DE CALIFICACIONES
-- =====================================================
CREATE TABLE ratings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    rater_id INT FOREIGN KEY REFERENCES users(id),
    rated_id INT FOREIGN KEY REFERENCES users(id),
    project_id INT FOREIGN KEY REFERENCES projects(id),
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    comment NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    -- Un usuario solo puede calificar una vez a otro usuario en un proyecto
    CONSTRAINT UQ_rating_rater_rated_project UNIQUE (rater_id, rated_id, project_id)
);

-- =====================================================
-- TABLA DE AMONESTACIONES (STRIKES)
-- =====================================================
CREATE TABLE strikes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE CASCADE,
    reason NVARCHAR(MAX) NOT NULL,
    severity NVARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    issued_by INT FOREIGN KEY REFERENCES users(id),
    issued_at DATETIME2 DEFAULT GETDATE(),
    is_active BIT DEFAULT 1,
    resolved_at DATETIME2,
    resolution_notes NVARCHAR(MAX)
);

-- =====================================================
-- TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    title NVARCHAR(200) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    notification_type NVARCHAR(50) DEFAULT 'general',
    is_read BIT DEFAULT 0,
    read_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    expires_at DATETIME2,
    action_url NVARCHAR(500),
    priority NVARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- =====================================================
-- TABLA DE NOTIFICACIONES MASIVAS
-- =====================================================
CREATE TABLE mass_notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    target_role NVARCHAR(20) CHECK (target_role IN ('admin', 'student', 'company', 'all')),
    sent_by INT FOREIGN KEY REFERENCES users(id),
    sent_at DATETIME2 DEFAULT GETDATE(),
    total_recipients INT DEFAULT 0,
    read_count INT DEFAULT 0,
    is_active BIT DEFAULT 1
);

-- =====================================================
-- TABLA DE REGISTROS DISCIPLINARIOS
-- =====================================================
CREATE TABLE disciplinary_records (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE CASCADE,
    incident_date DATE NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    action_taken NVARCHAR(MAX),
    severity NVARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    recorded_by INT FOREIGN KEY REFERENCES users(id),
    recorded_at DATETIME2 DEFAULT GETDATE(),
    is_resolved BIT DEFAULT 0,
    resolution_date DATETIME2,
    resolution_notes NVARCHAR(MAX)
);

-- =====================================================
-- TABLA DE ENTREVISTAS
-- =====================================================
CREATE TABLE interviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT FOREIGN KEY REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_id INT FOREIGN KEY REFERENCES users(id),
    interview_date DATETIME2 NOT NULL,
    duration_minutes INT DEFAULT 60,
    location NVARCHAR(200),
    interview_type NVARCHAR(50) DEFAULT 'video' CHECK (interview_type IN ('video', 'phone', 'in-person')),
    status NVARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    notes NVARCHAR(MAX),
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    feedback NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE EVENTOS DE CALENDARIO
-- =====================================================
CREATE TABLE calendar_events (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    start_date DATETIME2 NOT NULL,
    end_date DATETIME2 NOT NULL,
    location NVARCHAR(200),
    event_type NVARCHAR(50) DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'deadline', 'presentation', 'other')),
    created_by INT NOT NULL FOREIGN KEY REFERENCES users(id),
    project_id INT FOREIGN KEY REFERENCES projects(id),
    is_all_day BIT DEFAULT 0,
    reminder_minutes INT DEFAULT 15,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE DOCUMENTOS
-- =====================================================
CREATE TABLE documents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    file_path NVARCHAR(500) NOT NULL,
    file_name NVARCHAR(200) NOT NULL,
    file_size BIGINT,
    file_type NVARCHAR(50),
    uploaded_by INT NOT NULL FOREIGN KEY REFERENCES users(id),
    project_id INT FOREIGN KEY REFERENCES projects(id),
    is_public BIT DEFAULT 0,
    download_count INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE PREFERENCIAS DE NOTIFICACIÓN
-- =====================================================
CREATE TABLE notification_preferences (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    notification_type NVARCHAR(50) NOT NULL,
    email_enabled BIT DEFAULT 1,
    push_enabled BIT DEFAULT 1,
    sms_enabled BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT UQ_notification_preferences_user_type UNIQUE (user_id, notification_type)
);

-- =====================================================
-- TABLA DE LOGS DE ACTIVIDAD
-- =====================================================
CREATE TABLE activity_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    action NVARCHAR(100) NOT NULL,
    table_name NVARCHAR(100),
    record_id INT,
    old_values NVARCHAR(MAX), -- JSON
    new_values NVARCHAR(MAX), -- JSON
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE CONFIGURACIÓN DE PLATAFORMA
-- =====================================================
CREATE TABLE platform_config (
    id INT IDENTITY(1,1) PRIMARY KEY,
    key_name NVARCHAR(100) UNIQUE NOT NULL,
    value NVARCHAR(MAX),
    description NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE REPORTES
-- =====================================================
CREATE TABLE reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    report_type NVARCHAR(50) NOT NULL,
    parameters NVARCHAR(MAX), -- JSON
    generated_by INT NOT NULL FOREIGN KEY REFERENCES users(id),
    file_path NVARCHAR(500),
    file_size INT,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at DATETIME2 DEFAULT GETDATE(),
    completed_at DATETIME2
);

-- =====================================================
-- TABLA DE BACKUPS DE DATOS
-- =====================================================
CREATE TABLE data_backups (
    id INT IDENTITY(1,1) PRIMARY KEY,
    backup_name NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    file_path NVARCHAR(500) NOT NULL,
    file_size BIGINT,
    backup_type NVARCHAR(50) DEFAULT 'full' CHECK (backup_type IN ('full', 'incremental', 'differential')),
    status NVARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_by INT NOT NULL FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 DEFAULT GETDATE(),
    completed_at DATETIME2
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR RENDIMIENTO
-- =====================================================
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_role ON users(role);
CREATE INDEX IX_students_user_id ON students(user_id);
CREATE INDEX IX_companies_user_id ON companies(user_id);
CREATE INDEX IX_projects_company_id ON projects(company_id);
CREATE INDEX IX_projects_status_id ON projects(status_id);
CREATE INDEX IX_applications_project_id ON applications(project_id);
CREATE INDEX IX_applications_student_id ON applications(student_id);
CREATE INDEX IX_applications_status ON applications(status);
CREATE INDEX IX_work_hours_student_id ON work_hours(student_id);
CREATE INDEX IX_work_hours_project_id ON work_hours(project_id);
CREATE INDEX IX_work_hours_date ON work_hours(fecha);
CREATE INDEX IX_evaluations_student_id ON evaluations(student_id);
CREATE INDEX IX_evaluations_project_id ON evaluations(project_id);
CREATE INDEX IX_notifications_user_id ON notifications(user_id);
CREATE INDEX IX_notifications_is_read ON notifications(is_read);
CREATE INDEX IX_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IX_calendar_events_created_by ON calendar_events(created_by);

-- Índices compuestos para consultas frecuentes
CREATE INDEX IX_applications_project_student ON applications(project_id, student_id);
CREATE INDEX IX_work_hours_student_date ON work_hours(student_id, fecha);
CREATE INDEX IX_evaluations_student_project ON evaluations(student_id, project_id);
CREATE INDEX IX_notifications_user_read ON notifications(user_id, is_read);
GO

-- =====================================================
-- VISTAS PARA CONSULTAS FRECUENTES
-- =====================================================

-- Vista de estadísticas de estudiantes
CREATE VIEW v_student_stats AS
SELECT 
    s.id,
    s.user_id,
    u.name,
    u.email,
    s.career,
    s.semester,
    s.api_level,
    s.strikes,
    s.gpa,
    s.completed_projects,
    s.total_hours,
    s.rating,
    COUNT(DISTINCT a.id) as total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as accepted_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_projects_count
FROM students s
JOIN users u ON s.user_id = u.id
LEFT JOIN applications a ON s.id = a.student_id
GROUP BY s.id, s.user_id, u.name, u.email, s.career, s.semester, s.api_level, s.strikes, s.gpa, s.completed_projects, s.total_hours, s.rating;
GO

-- Vista de estadísticas de empresas
CREATE VIEW v_company_stats AS
SELECT 
    c.id,
    c.user_id,
    u.name,
    u.email,
    c.company_name,
    c.industry,
    c.size,
    c.verified,
    c.rating,
    c.total_projects,
    COUNT(DISTINCT p.id) as active_projects,
    COUNT(DISTINCT a.id) as total_applications_received,
    COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as accepted_applications
FROM companies c
JOIN users u ON c.user_id = u.id
LEFT JOIN projects p ON c.id = p.company_id
LEFT JOIN applications a ON p.id = a.project_id
GROUP BY c.id, c.user_id, u.name, u.email, c.company_name, c.industry, c.size, c.verified, c.rating, c.total_projects;
GO

-- Vista de estadísticas de proyectos
CREATE VIEW v_project_stats AS
SELECT 
    p.id,
    p.title,
    p.company_id,
    c.company_name,
    ps.name as status_name,
    p.api_level,
    p.required_hours,
    p.start_date,
    p.estimated_end_date,
    p.real_end_date,
    COUNT(DISTINCT a.id) as total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as accepted_applications,
    COUNT(DISTINCT wh.id) as total_work_hours_records,
    SUM(wh.horas_trabajadas) as total_hours_worked
FROM projects p
JOIN companies c ON p.company_id = c.id
JOIN project_status ps ON p.status_id = ps.id
LEFT JOIN applications a ON p.id = a.project_id
LEFT JOIN work_hours wh ON p.id = wh.project_id
GROUP BY p.id, p.title, p.company_id, c.company_name, ps.name, p.api_level, p.required_hours, p.start_date, p.estimated_end_date, p.real_end_date;
GO

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar niveles TRL
INSERT INTO trl_levels (level, name, description) VALUES
(1, 'TRL 1 - Principios básicos observados', 'Los principios científicos básicos han sido observados y reportados'),
(2, 'TRL 2 - Concepto tecnológico formulado', 'Se ha formulado el concepto tecnológico y/o aplicación'),
(3, 'TRL 3 - Prueba de concepto analítica y experimental', 'Se ha verificado la prueba de concepto analítica y experimental'),
(4, 'TRL 4 - Validación en laboratorio', 'Se ha validado el componente y/o subsistema en entorno de laboratorio'),
(5, 'TRL 5 - Validación en entorno relevante', 'Se ha validado el componente y/o subsistema en entorno relevante'),
(6, 'TRL 6 - Demostración en entorno relevante', 'Se ha demostrado el prototipo del sistema en entorno relevante'),
(7, 'TRL 7 - Demostración en entorno operacional', 'Se ha demostrado el prototipo del sistema en entorno operacional'),
(8, 'TRL 8 - Sistema completo calificado', 'Se ha calificado el sistema completo a través de pruebas y demostración'),
(9, 'TRL 9 - Sistema probado en operación', 'El sistema ha sido probado en operación exitosa');

-- Insertar áreas de conocimiento
INSERT INTO areas (name, description) VALUES
('Inteligencia Artificial', 'Machine Learning, Deep Learning, NLP, Computer Vision'),
('Desarrollo Web', 'Frontend, Backend, Full Stack, APIs'),
('Desarrollo Móvil', 'iOS, Android, React Native, Flutter'),
('Ciberseguridad', 'Seguridad de aplicaciones, Redes, Criptografía'),
('Ciencia de Datos', 'Análisis de datos, Big Data, Business Intelligence'),
('DevOps', 'CI/CD, Cloud Computing, Infraestructura como código'),
('Blockchain', 'Smart Contracts, DApps, Criptomonedas'),
('IoT', 'Internet de las Cosas, Sensores, Automatización'),
('Realidad Virtual/Aumentada', 'VR, AR, MR, Desarrollo de experiencias inmersivas'),
('Robótica', 'Automatización, Control de robots, Sistemas embebidos');

-- Insertar estados de proyecto
INSERT INTO project_status (name, description, color) VALUES
('Borrador', 'Proyecto en fase de planificación', '#6c757d'),
('Abierto', 'Proyecto disponible para postulaciones', '#28a745'),
('En Revisión', 'Evaluando postulaciones recibidas', '#ffc107'),
('En Progreso', 'Proyecto en ejecución', '#007bff'),
('Completado', 'Proyecto finalizado exitosamente', '#28a745'),
('Cancelado', 'Proyecto cancelado o suspendido', '#dc3545'),
('Archivado', 'Proyecto archivado', '#6c757d');

-- Insertar categorías de evaluación
INSERT INTO evaluation_categories (name, description, weight) VALUES
('Calidad del Trabajo', 'Evaluación de la calidad y precisión del trabajo realizado', 0.30),
('Cumplimiento de Plazos', 'Puntualidad en la entrega de tareas y proyectos', 0.25),
('Comunicación', 'Efectividad en la comunicación con el equipo y stakeholders', 0.20),
('Iniciativa', 'Proactividad y capacidad de resolver problemas', 0.15),
('Trabajo en Equipo', 'Colaboración y contribución al equipo', 0.10);

-- Insertar configuración inicial de la plataforma
INSERT INTO platform_config (key_name, value, description) VALUES
('max_strikes_student', '3', 'Número máximo de amonestaciones antes de suspensión'),
('min_hours_graduation', '360', 'Horas mínimas requeridas para graduación'),
('api_level_requirements', '{"1": 0, "2": 50, "3": 150, "4": 300}', 'Horas requeridas para cada nivel API'),
('project_duration_limit', '12', 'Duración máxima de proyectos en meses'),
('notification_retention_days', '90', 'Días de retención de notificaciones'),
('max_file_size_mb', '10', 'Tamaño máximo de archivos en MB'),
('allowed_file_types', 'pdf,doc,docx,jpg,png,zip', 'Tipos de archivo permitidos');

GO

PRINT 'Esquema de base de datos LEANMAKER creado exitosamente!';
PRINT 'Total de tablas creadas: 25';
PRINT 'Total de vistas creadas: 3';
PRINT 'Datos iniciales insertados correctamente.';

-- =====================================================
-- VERIFICACIÓN FINAL DE OBJETOS CREADOS
-- =====================================================
PRINT '';
PRINT '=== VERIFICACIÓN DE OBJETOS CREADOS ===';

-- Verificar tablas creadas
DECLARE @table_count INT = 0;
SELECT @table_count = COUNT(*) FROM sys.tables WHERE type = 'U';
PRINT 'Tablas creadas: ' + CAST(@table_count AS VARCHAR(10));

-- Verificar vistas creadas
DECLARE @view_count INT = 0;
SELECT @view_count = COUNT(*) FROM sys.views;
PRINT 'Vistas creadas: ' + CAST(@view_count AS VARCHAR(10));

-- Verificar índices creados
DECLARE @index_count INT = 0;
SELECT @index_count = COUNT(*) FROM sys.indexes WHERE type > 0;
PRINT 'Índices creados: ' + CAST(@index_count AS VARCHAR(10));

-- Verificar datos iniciales
DECLARE @trl_count INT = 0;
SELECT @trl_count = COUNT(*) FROM trl_levels;
PRINT 'Niveles TRL insertados: ' + CAST(@trl_count AS VARCHAR(10));

DECLARE @areas_count INT = 0;
SELECT @areas_count = COUNT(*) FROM areas;
PRINT 'Áreas de conocimiento insertadas: ' + CAST(@areas_count AS VARCHAR(10));

DECLARE @status_count INT = 0;
SELECT @status_count = COUNT(*) FROM project_status;
PRINT 'Estados de proyecto insertados: ' + CAST(@status_count AS VARCHAR(10));

DECLARE @categories_count INT = 0;
SELECT @categories_count = COUNT(*) FROM evaluation_categories;
PRINT 'Categorías de evaluación insertadas: ' + CAST(@categories_count AS VARCHAR(10));

DECLARE @config_count INT = 0;
SELECT @config_count = COUNT(*) FROM platform_config;
PRINT 'Configuraciones de plataforma insertadas: ' + CAST(@config_count AS VARCHAR(10));

PRINT '';
PRINT '=== VERIFICACIÓN COMPLETADA ===';
PRINT 'La base de datos está lista para usar con Django.';
PRINT 'Recuerda ejecutar las migraciones de Django después de crear la base de datos.'; 



