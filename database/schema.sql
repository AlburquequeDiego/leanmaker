-- =====================================================
-- ESQUEMA UNIFICADO DE BASE DE DATOS - LEANMAKER
-- SQL Server - Optimizado para Django ORM y Frontend React
-- Versión mejorada y corregida para Azure SQL Database
-- Compatible con los modelos de Django y tipos de TypeScript
-- =====================================================

USE leanmaker_db;
GO

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
-- TABLA DE USUARIOS (COMPATIBLE CON DJANGO)
-- =====================================================

CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(254) UNIQUE NOT NULL,
    password NVARCHAR(128) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student', 'company')),
    first_name NVARCHAR(150),
    last_name NVARCHAR(150),
    username NVARCHAR(150) UNIQUE,
    phone NVARCHAR(20),
    avatar NVARCHAR(500),
    bio NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    is_staff BIT DEFAULT 0,
    is_superuser BIT DEFAULT 0,
    is_verified BIT DEFAULT 0,
    date_joined DATETIME2 DEFAULT GETDATE(),
    last_login DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_users_email_format CHECK (email LIKE '%_@__%.__%'),
    CONSTRAINT CK_users_password_length CHECK (LEN(password) >= 8)
);

-- Tabla de administradores
CREATE TABLE admins (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id UNIQUEIDENTIFIER UNIQUE FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    permissions NVARCHAR(MAX), -- JSON array de permisos
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE EMPRESAS (COMPATIBLE CON FRONTEND)
-- =====================================================
CREATE TABLE companies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id UNIQUEIDENTIFIER UNIQUE FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
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
    projects_completed INT DEFAULT 0 CHECK (projects_completed >= 0),
    total_hours_offered INT DEFAULT 0 CHECK (total_hours_offered >= 0),
    technologies_used NVARCHAR(MAX), -- JSON array
    benefits_offered NVARCHAR(MAX), -- JSON array
    remote_work_policy NVARCHAR(50) CHECK (remote_work_policy IN ('full-remote', 'hybrid', 'onsite')),
    internship_duration NVARCHAR(50),
    stipend_range NVARCHAR(100),
    contact_email NVARCHAR(254),
    contact_phone NVARCHAR(20),
    status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_companies_name_length CHECK (LEN(company_name) >= 2),
    CONSTRAINT CK_companies_website_format CHECK (website IS NULL OR website LIKE 'http%'),
    CONSTRAINT CK_companies_contact_email_format CHECK (contact_email IS NULL OR contact_email LIKE '%_@__%.__%')
);

-- =====================================================
-- TABLA DE ESTUDIANTES (COMPATIBLE CON FRONTEND)
-- =====================================================
CREATE TABLE students (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id UNIQUEIDENTIFIER UNIQUE FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
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
-- TABLA DE PROYECTOS (COMPATIBLE CON DJANGO Y FRONTEND)
-- =====================================================
CREATE TABLE projects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE CASCADE,
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
    modality NVARCHAR(20) DEFAULT 'remote' CHECK (modality IN ('remote', 'onsite', 'hybrid')),
    location NVARCHAR(200),
    difficulty NVARCHAR(20) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    required_skills NVARCHAR(MAX), -- JSON array
    preferred_skills NVARCHAR(MAX), -- JSON array
    min_api_level INT DEFAULT 1 CHECK (min_api_level BETWEEN 1 AND 4),
    duration_months INT DEFAULT 3,
    hours_per_week INT DEFAULT 20,
    is_paid BIT DEFAULT 0,
    payment_amount DECIMAL(10,2),
    payment_currency NVARCHAR(3) DEFAULT 'USD',
    max_students INT DEFAULT 1,
    current_students INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    is_featured BIT DEFAULT 0,
    is_urgent BIT DEFAULT 0,
    tags NVARCHAR(MAX), -- JSON array
    published_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE HISTORIAL DE ESTADOS DE PROYECTO
-- =====================================================
CREATE TABLE project_status_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    status_id INT FOREIGN KEY REFERENCES project_status(id),
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    fecha_cambio DATETIME2 DEFAULT GETDATE(),
    comentario NVARCHAR(MAX)
);

-- =====================================================
-- TABLA DE POSTULACIONES (COMPATIBLE CON DJANGO)
-- =====================================================
CREATE TABLE applications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    project_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE NO ACTION,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interviewed', 'accepted', 'rejected', 'withdrawn', 'completed')),
    cover_letter NVARCHAR(MAX),
    compatibility_score INT CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    company_notes NVARCHAR(MAX),
    student_notes NVARCHAR(MAX),
    portfolio_url NVARCHAR(500),
    github_url NVARCHAR(500),
    linkedin_url NVARCHAR(500),
    applied_at DATETIME2 DEFAULT GETDATE(),
    reviewed_at DATETIME2,
    responded_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Una aplicación por estudiante y proyecto
    CONSTRAINT UQ_application_student_project UNIQUE (project_id, student_id)
);

-- =====================================================
-- TABLA DE ASIGNACIONES
-- =====================================================
CREATE TABLE assignments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    application_id UNIQUEIDENTIFIER UNIQUE FOREIGN KEY REFERENCES applications(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    tareas NVARCHAR(MAX),
    estado NVARCHAR(20) DEFAULT 'en curso' CHECK (estado IN ('en curso', 'completado', 'cancelado')),
    hours_worked INT DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE HORAS TRABAJADAS
-- =====================================================



CREATE TABLE work_hours (
    id INT IDENTITY(1,1) PRIMARY KEY,
    assignment_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE NO ACTION,
    project_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES projects(id) ON DELETE NO ACTION,
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE NO ACTION,
    fecha DATE NOT NULL,
    horas_trabajadas INT CHECK (horas_trabajadas > 0),
    descripcion NVARCHAR(MAX),
    estado_validacion NVARCHAR(20) DEFAULT 'pendiente' CHECK (estado_validacion IN ('pendiente', 'aprobado', 'rechazado')),
    validador_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    fecha_validacion DATETIME2,
    comentario_validacion NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
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
    project_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES projects(id) ON DELETE NO ACTION,
    evaluator_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    category_id INT FOREIGN KEY REFERENCES evaluation_categories(id),
    score DECIMAL(3,2) CHECK (score >= 0 AND score <= 10),
    comments NVARCHAR(MAX),
    evaluation_date DATETIME2 DEFAULT GETDATE(),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    -- Una evaluación por estudiante, proyecto y categoría
    CONSTRAINT UQ_evaluation_student_project_category UNIQUE (student_id, project_id, category_id)
);


-- =====================================================
-- TABLA DE CALIFICACIONES
-- =====================================================
CREATE TABLE ratings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    rater_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    rated_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    project_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES projects(id),
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
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE NO ACTION,
    reason NVARCHAR(MAX) NOT NULL,
    severity NVARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    issued_by UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
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
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
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
    sent_by UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
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
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE NO ACTION,
    incident_date DATE NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    action_taken NVARCHAR(MAX),
    severity NVARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    recorded_by UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    recorded_at DATETIME2 DEFAULT GETDATE()
);



-- =====================================================
-- TABLA DE ENTREVISTAS
-- =====================================================
CREATE TABLE interviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    interview_date DATETIME2 NOT NULL,
    duration_minutes INT DEFAULT 60,
    interview_type NVARCHAR(20) DEFAULT 'video' CHECK (interview_type IN ('video', 'phone', 'onsite')),
    status NVARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    notes NVARCHAR(MAX),
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
    event_type NVARCHAR(50) DEFAULT 'general' CHECK (event_type IN ('general', 'interview', 'meeting', 'deadline', 'reminder')),
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    project_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES projects(id),
    is_all_day BIT DEFAULT 0,
    location NVARCHAR(200),
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
    file_url NVARCHAR(500) NOT NULL,
    file_type NVARCHAR(50),
    file_size INT,
    uploaded_by UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    project_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES projects(id),
    is_public BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);



-- =====================================================
-- TABLA DE PREFERENCIAS DE NOTIFICACIÓN
-- =====================================================
CREATE TABLE notification_preferences (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BIT DEFAULT 1,
    push_notifications BIT DEFAULT 1,
    sms_notifications BIT DEFAULT 0,
    notification_types NVARCHAR(MAX), -- JSON array de tipos permitidos
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);



-- =====================================================
-- TABLA DE LOGS DE ACTIVIDAD
-- =====================================================
CREATE TABLE activity_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    action NVARCHAR(100) NOT NULL,
    entity_type NVARCHAR(50),
    entity_id NVARCHAR(50),
    details NVARCHAR(MAX),
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE()
);



-- =====================================================
-- TABLA DE REPORTES
-- =====================================================
CREATE TABLE reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    report_type NVARCHAR(50) NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    generated_by UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    report_data NVARCHAR(MAX), -- JSON con los datos del reporte
    file_url NVARCHAR(500),
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at DATETIME2 DEFAULT GETDATE(),
    completed_at DATETIME2
);



-- =====================================================
-- TABLA DE RESPALDOS DE DATOS
-- =====================================================
CREATE TABLE data_backups (
    id INT IDENTITY(1,1) PRIMARY KEY,
    backup_name NVARCHAR(200) NOT NULL,
    backup_type NVARCHAR(50) DEFAULT 'full' CHECK (backup_type IN ('full', 'incremental', 'differential')),
    file_url NVARCHAR(500),
    file_size BIGINT,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_by UNIQUEIDENTIFIER FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 DEFAULT GETDATE(),
    completed_at DATETIME2
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR RENDIMIENTO
-- =====================================================

-- Índices para usuarios
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_role ON users(role);
CREATE INDEX IX_users_is_active ON users(is_active);

-- Índices para estudiantes
CREATE INDEX IX_students_user_id ON students(user_id);
CREATE INDEX IX_students_status ON students(status);
CREATE INDEX IX_students_api_level ON students(api_level);
CREATE INDEX IX_students_strikes ON students(strikes);

-- Índices para empresas
CREATE INDEX IX_companies_user_id ON companies(user_id);
CREATE INDEX IX_companies_status ON companies(status);
CREATE INDEX IX_companies_verified ON companies(verified);

-- Índices para proyectos
CREATE INDEX IX_projects_company_id ON projects(company_id);
CREATE INDEX IX_projects_status_id ON projects(status_id);
CREATE INDEX IX_projects_area_id ON projects(area_id);
CREATE INDEX IX_projects_api_level ON projects(api_level);
CREATE INDEX IX_projects_is_featured ON projects(is_featured);
CREATE INDEX IX_projects_created_at ON projects(created_at);

-- Índices para aplicaciones
CREATE INDEX IX_applications_project_id ON applications(project_id);
CREATE INDEX IX_applications_student_id ON applications(student_id);
CREATE INDEX IX_applications_status ON applications(status);
CREATE INDEX IX_applications_applied_at ON applications(applied_at);

-- Índices para horas trabajadas
CREATE INDEX IX_work_hours_student_id ON work_hours(student_id);
CREATE INDEX IX_work_hours_project_id ON work_hours(project_id);
CREATE INDEX IX_work_hours_fecha ON work_hours(fecha);
CREATE INDEX IX_work_hours_estado_validacion ON work_hours(estado_validacion);

-- Índices para evaluaciones
CREATE INDEX IX_evaluations_student_id ON evaluations(student_id);
CREATE INDEX IX_evaluations_project_id ON evaluations(project_id);
CREATE INDEX IX_evaluations_category_id ON evaluations(category_id);

-- Índices para notificaciones
CREATE INDEX IX_notifications_user_id ON notifications(user_id);
CREATE INDEX IX_notifications_is_read ON notifications(is_read);
CREATE INDEX IX_notifications_created_at ON notifications(created_at);

-- Índices para eventos de calendario
CREATE INDEX IX_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IX_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IX_calendar_events_event_type ON calendar_events(event_type);

-- Índices compuestos para optimizar consultas frecuentes
CREATE INDEX IX_applications_project_student ON applications(project_id, student_id);
CREATE INDEX IX_work_hours_student_fecha ON work_hours(student_id, fecha);
CREATE INDEX IX_evaluations_student_project ON evaluations(student_id, project_id);
CREATE INDEX IX_notifications_user_read ON notifications(user_id, is_read);

-- =====================================================
-- VISTAS PARA CONSULTAS FRECUENTES
-- =====================================================
GO

-- Vista de estadísticas de estudiantes
DROP VIEW IF EXISTS v_student_stats;
GO
CREATE VIEW v_student_stats AS
SELECT 
    s.id,
    s.user_id,
    u.email,
    ISNULL(u.first_name, '') + ' ' + ISNULL(u.last_name, '') AS full_name,
    s.career,
    s.semester,
    s.gpa,
    s.api_level,
    s.strikes,
    s.completed_projects,
    s.total_hours,
    s.rating,
    s.status,
    COUNT(DISTINCT a.id) AS total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) AS accepted_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) AS completed_applications
FROM students s
JOIN users u ON s.user_id = u.id
LEFT JOIN applications a ON s.id = a.student_id
GROUP BY s.id, s.user_id, u.email, u.first_name, u.last_name, s.career, s.semester, s.gpa, s.api_level, s.strikes, s.completed_projects, s.total_hours, s.rating, s.status;
GO

-- Vista de estadísticas de empresas
DROP VIEW IF EXISTS v_company_stats;
GO
CREATE VIEW v_company_stats AS
SELECT 
    c.id,
    c.user_id,
    u.email,
    c.company_name,
    c.industry,
    c.size,
    c.rating,
    c.verified,
    c.status,
    c.total_projects,
    c.projects_completed,
    c.total_hours_offered,
    COUNT(DISTINCT p.id) AS active_projects,
    COUNT(DISTINCT a.id) AS total_applications_received,
    COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) AS accepted_applications,
    AVG(CAST(a.compatibility_score AS FLOAT)) AS avg_compatibility_score
FROM companies c
JOIN users u ON c.user_id = u.id
LEFT JOIN projects p ON c.id = p.company_id AND p.status_id IN (SELECT id FROM project_status WHERE name IN ('published', 'in_progress'))
LEFT JOIN applications a ON p.id = a.project_id
GROUP BY c.id, c.user_id, u.email, c.company_name, c.industry, c.size, c.rating, c.verified, c.status, c.total_projects, c.projects_completed, c.total_hours_offered;
GO

-- Vista de estadísticas de proyectos
DROP VIEW IF EXISTS v_project_stats;
GO
CREATE VIEW v_project_stats AS
SELECT 
    p.id,
    p.title,
    p.company_id,
    c.company_name,
    ps.name AS status,
    p.api_level,
    p.required_hours,
    p.max_students,
    p.current_students,
    p.applications_count,
    p.views_count,
    p.is_featured,
    p.is_urgent,
    p.created_at,
    p.published_at,
    COUNT(DISTINCT a.id) AS total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) AS accepted_applications,
    COUNT(DISTINCT wh.id) AS total_work_hours_records,
    SUM(wh.horas_trabajadas) AS total_hours_worked
FROM projects p
JOIN companies c ON p.company_id = c.id
JOIN project_status ps ON p.status_id = ps.id
LEFT JOIN applications a ON p.id = a.project_id
LEFT JOIN work_hours wh ON p.id = wh.project_id
GROUP BY p.id, p.title, p.company_id, c.company_name, ps.name, p.api_level, p.required_hours, p.max_students, p.current_students, p.applications_count, p.views_count, p.is_featured, p.is_urgent, p.created_at, p.published_at;
GO

-- Vista de evaluaciones completas
DROP VIEW IF EXISTS v_evaluations_complete;
GO
CREATE VIEW v_evaluations_complete AS
SELECT 
    e.id,
    e.student_id,
    s.user_id AS student_user_id,
    ISNULL(u_student.first_name, '') + ' ' + ISNULL(u_student.last_name, '') AS student_name,
    e.project_id,
    p.title AS project_title,
    e.evaluator_id,
    ISNULL(u_evaluator.first_name, '') + ' ' + ISNULL(u_evaluator.last_name, '') AS evaluator_name,
    e.category_id,
    ec.name AS category_name,
    e.score,
    e.comments,
    e.evaluation_date,
    e.created_at
FROM evaluations e
JOIN students s ON e.student_id = s.id
JOIN users u_student ON s.user_id = u_student.id
JOIN projects p ON e.project_id = p.id
JOIN users u_evaluator ON e.evaluator_id = u_evaluator.id
JOIN evaluation_categories ec ON e.category_id = ec.id;
GO

-- Vista del dashboard de administrador
DROP VIEW IF EXISTS v_admin_dashboard;
GO
CREATE VIEW v_admin_dashboard AS
SELECT 
    'users' AS metric_type,
    COUNT(*) AS total_count,
    COUNT(CASE WHEN role = 'student' THEN 1 END) AS students_count,
    COUNT(CASE WHEN role = 'company' THEN 1 END) AS companies_count,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) AS admins_count,
    COUNT(CASE WHEN is_active = 1 THEN 1 END) AS active_users,
    COUNT(CASE WHEN is_verified = 1 THEN 1 END) AS verified_users
FROM users
UNION ALL
SELECT 
    'projects' AS metric_type,
    COUNT(*) AS total_count,
    COUNT(CASE WHEN ps.name = 'published' THEN 1 END) AS published_count,
    COUNT(CASE WHEN ps.name = 'in_progress' THEN 1 END) AS in_progress_count,
    COUNT(CASE WHEN ps.name = 'completed' THEN 1 END) AS completed_count,
    COUNT(CASE WHEN p.is_featured = 1 THEN 1 END) AS featured_count,
    COUNT(CASE WHEN p.is_urgent = 1 THEN 1 END) AS urgent_count
FROM projects p
JOIN project_status ps ON p.status_id = ps.id
UNION ALL
SELECT 
    'applications' AS metric_type,
    COUNT(*) AS total_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS accepted_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_count,
    0 AS urgent_count
FROM applications;
GO

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar niveles TRL


INSERT INTO trl_levels (level, name, description) VALUES
(1, 'TRL 1 - Principios básicos observados', 'Investigación científica básica'),
(2, 'TRL 2 - Concepto tecnológico formulado', 'Investigación aplicada'),
(3, 'TRL 3 - Prueba de concepto analítica y experimental', 'Desarrollo de concepto'),
(4, 'TRL 4 - Validación en laboratorio', 'Validación en entorno de laboratorio'),
(5, 'TRL 5 - Validación en entorno relevante', 'Validación en entorno relevante'),
(6, 'TRL 6 - Demostración en entorno relevante', 'Demostración en entorno relevante'),
(7, 'TRL 7 - Demostración en entorno operacional', 'Demostración en entorno operacional'),
(8, 'TRL 8 - Sistema completo y calificado', 'Sistema completo y calificado'),
(9, 'TRL 9 - Sistema probado en entorno operacional', 'Sistema probado en entorno operacional');

-- Insertar áreas de conocimiento
INSERT INTO areas (name, description) VALUES
('Tecnología', 'Desarrollo de software, aplicaciones y sistemas tecnológicos'),
('Marketing', 'Estrategias de marketing digital y tradicional'),
('Diseño', 'Diseño gráfico, UX/UI y diseño industrial'),
('Negocios', 'Consultoría empresarial y análisis de mercado'),
('Educación', 'Desarrollo de contenido educativo y plataformas de aprendizaje'),
('Salud', 'Tecnologías médicas y aplicaciones de salud'),
('Medio Ambiente', 'Proyectos de sostenibilidad y conservación'),
('Arte y Cultura', 'Proyectos artísticos y culturales'),
('Deportes', 'Aplicaciones deportivas y fitness'),
('Finanzas', 'Aplicaciones financieras y fintech');

-- Insertar estados de proyecto
INSERT INTO project_status (name, description, color) VALUES
('draft', 'Borrador - Proyecto en desarrollo', '#6c757d'),
('published', 'Publicado - Disponible para aplicaciones', '#28a745'),
('in_progress', 'En Progreso - Proyecto activo', '#007bff'),
('completed', 'Completado - Proyecto finalizado', '#28a745'),
('cancelled', 'Cancelado - Proyecto cancelado', '#dc3545'),
('paused', 'Pausado - Proyecto temporalmente suspendido', '#ffc107'),
('reviewing', 'En Revisión - Aplicaciones siendo evaluadas', '#17a2b8');

-- Insertar categorías de evaluación
INSERT INTO evaluation_categories (name, description, weight) VALUES
('Trabajo en Equipo', 'Capacidad de colaborar efectivamente con otros', 0.25),
('Comunicación', 'Habilidades de comunicación oral y escrita', 0.20),
('Responsabilidad', 'Cumplimiento de plazos y compromisos', 0.25),
('Calidad del Trabajo', 'Excelencia en la entrega de resultados', 0.20),
('Iniciativa', 'Proactividad y capacidad de resolver problemas', 0.10);

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================
PRINT 'Esquema de base de datos LEANMAKER creado exitosamente!';
PRINT 'Total de tablas creadas: 25';
PRINT 'Total de vistas creadas: 5';
PRINT 'Datos iniciales insertados correctamente.';
PRINT '';
PRINT '=== VERIFICACIÓN DE OBJETOS CREADOS ===';
PRINT 'Tablas creadas: ' + CAST((SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0) AS NVARCHAR(10));
PRINT 'Vistas creadas: ' + CAST((SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped = 0) AS NVARCHAR(10));
PRINT 'Índices creados: ' + CAST((SELECT COUNT(*) FROM sys.indexes WHERE object_id IN (SELECT object_id FROM sys.tables WHERE is_ms_shipped = 0)) AS NVARCHAR(10));
PRINT 'Niveles TRL insertados: ' + CAST((SELECT COUNT(*) FROM trl_levels) AS NVARCHAR(10));
PRINT 'Áreas de conocimiento insertadas: ' + CAST((SELECT COUNT(*) FROM areas) AS NVARCHAR(10));
PRINT 'Estados de proyecto insertados: ' + CAST((SELECT COUNT(*) FROM project_status) AS NVARCHAR(10));
PRINT 'Categorías de evaluación insertadas: ' + CAST((SELECT COUNT(*) FROM evaluation_categories) AS NVARCHAR(10));

