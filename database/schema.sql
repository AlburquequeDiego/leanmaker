-- =====================================================
-- ESQUEMA DE BASE DE DATOS - LEANMAKER (VERSIÓN PULIDA)
-- SQL Server
-- Optimizado para rendimiento y integridad de datos
-- =====================================================

--SQL Server (mssql)
--nombre del servidor: 
--nombre de la base de datos: leanmaker_db


USE leanmaker_db;
GO

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
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE CASCADE,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    requirements NVARCHAR(MAX), -- JSON array de requisitos
    skills_required NVARCHAR(MAX), -- JSON array de habilidades
    duration NVARCHAR(100),
    difficulty NVARCHAR(20) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    api_level INT DEFAULT 1 CHECK (api_level BETWEEN 1 AND 4),
    max_students INT DEFAULT 1 CHECK (max_students >= 1 AND max_students <= 10),
    current_students INT DEFAULT 0 CHECK (current_students >= 0),
    applications_count INT DEFAULT 0 CHECK (applications_count >= 0),
    status NVARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'completed', 'draft', 'paused')),
    deadline DATE CHECK (deadline >= GETDATE()),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2) CHECK (budget >= 0),
    total_hours INT DEFAULT 0 CHECK (total_hours >= 0),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_projects_title_length CHECK (LEN(title) >= 5),
    CONSTRAINT CK_projects_description_length CHECK (LEN(description) >= 20),
    CONSTRAINT CK_projects_current_vs_max CHECK (current_students <= max_students),
    CONSTRAINT CK_projects_dates_logic CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date),
    CONSTRAINT CK_projects_deadline_logic CHECK (deadline IS NULL OR start_date IS NULL OR deadline >= start_date)
);

-- =====================================================
-- TABLA DE POSTULACIONES
-- =====================================================
CREATE TABLE applications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    cover_letter NVARCHAR(MAX),
    resume_url NVARCHAR(500),
    applied_at DATETIME2 DEFAULT GETDATE(),
    reviewed_at DATETIME2,
    reviewed_by INT FOREIGN KEY REFERENCES users(id),
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_applications_unique_student_project UNIQUE (project_id, student_id),
    CONSTRAINT CK_applications_reviewed_by_admin CHECK (reviewed_by IS NULL OR EXISTS (SELECT 1 FROM users WHERE id = reviewed_by AND role = 'admin')),
    CONSTRAINT CK_applications_reviewed_at_logic CHECK (reviewed_at IS NULL OR reviewed_at >= applied_at),
    CONSTRAINT CK_applications_resume_url CHECK (resume_url IS NULL OR resume_url LIKE 'http%')
);

-- =====================================================
-- TABLA DE EVALUACIONES
-- =====================================================
CREATE TABLE evaluations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    evaluator_id INT FOREIGN KEY REFERENCES users(id),
    type NVARCHAR(20) DEFAULT 'final' CHECK (type IN ('intermediate', 'final')),
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    overall_rating DECIMAL(3,2) CHECK (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 5)),
    comments NVARCHAR(MAX),
    strengths NVARCHAR(MAX), -- JSON array
    areas_for_improvement NVARCHAR(MAX), -- JSON array
    due_date DATE CHECK (due_date >= GETDATE()),
    completed_date DATE,
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
    CONSTRAINT CK_evaluation_categories_unique UNIQUE (evaluation_id, category_name)
);

-- =====================================================
-- TABLA DE CALIFICACIONES MUTUAS
-- =====================================================
CREATE TABLE ratings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    rater_id INT FOREIGN KEY REFERENCES users(id),
    rated_id INT FOREIGN KEY REFERENCES users(id),
    project_id INT FOREIGN KEY REFERENCES projects(id),
    rating DECIMAL(3,2) CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX),
    category NVARCHAR(50) CHECK (category IN ('technical', 'soft_skills', 'punctuality', 'teamwork', 'communication', 'overall')),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_ratings_unique_user_project UNIQUE (rater_id, rated_id, project_id, category),
    CONSTRAINT CK_ratings_different_users CHECK (rater_id != rated_id)
);

-- =====================================================
-- TABLA DE STRIKES
-- =====================================================
CREATE TABLE strikes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    reported_by INT FOREIGN KEY REFERENCES users(id),
    type NVARCHAR(20) DEFAULT 'other' CHECK (type IN ('attendance', 'quality', 'deadline', 'behavior', 'other')),
    severity NVARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description NVARCHAR(MAX) NOT NULL,
    evidence NVARCHAR(MAX),
    status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'appealed')),
    resolution NVARCHAR(MAX),
    resolved_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_strikes_description_length CHECK (LEN(description) >= 10),
    CONSTRAINT CK_strikes_resolved_date_logic CHECK (resolved_date IS NULL OR resolved_date >= created_at),
    CONSTRAINT CK_strikes_resolution_when_resolved CHECK (status != 'resolved' OR resolution IS NOT NULL)
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
    CONSTRAINT CK_notifications_title_length CHECK (LEN(title) >= 3),
    CONSTRAINT CK_notifications_message_length CHECK (LEN(message) >= 5),
    CONSTRAINT CK_notifications_related_url CHECK (related_url IS NULL OR related_url LIKE '/%')
);

-- =====================================================
-- TABLA DE REGISTRO DISCIPLINARIO
-- =====================================================
CREATE TABLE disciplinary_records (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('strike', 'warning', 'commendation')),
    reason NVARCHAR(500) NOT NULL,
    description NVARCHAR(MAX),
    assigned_by NVARCHAR(200) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_disciplinary_records_reason_length CHECK (LEN(reason) >= 5)
);

-- =====================================================
-- TABLA DE HORAS TRABAJADAS
-- =====================================================
CREATE TABLE work_hours (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    hours_worked DECIMAL(5,2) NOT NULL CHECK (hours_worked > 0 AND hours_worked <= 24),
    date_worked DATE NOT NULL CHECK (date_worked <= GETDATE()),
    description NVARCHAR(MAX),
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INT FOREIGN KEY REFERENCES users(id),
    approved_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_work_hours_unique_student_project_date UNIQUE (student_id, project_id, date_worked),
    CONSTRAINT CK_work_hours_approved_at_logic CHECK (approved_at IS NULL OR approved_at >= created_at),
    CONSTRAINT CK_work_hours_approved_by_admin CHECK (approved_by IS NULL OR EXISTS (SELECT 1 FROM users WHERE id = approved_by AND role IN ('admin', 'company')))
);

-- =====================================================
-- TABLA DE ENTREVISTAS
-- =====================================================
CREATE TABLE interviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    interviewer_id INT FOREIGN KEY REFERENCES users(id),
    type NVARCHAR(20) DEFAULT 'technical' CHECK (type IN ('technical', 'behavioral', 'final')),
    status NVARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    outcome NVARCHAR(20) DEFAULT 'pending' CHECK (outcome IN ('passed', 'failed', 'pending', 'needs-follow-up')),
    scheduled_date DATETIME2 NOT NULL CHECK (scheduled_date >= GETDATE()),
    duration INT DEFAULT 60 CHECK (duration >= 15 AND duration <= 480), -- minutos
    location NVARCHAR(200),
    notes NVARCHAR(MAX),
    feedback NVARCHAR(MAX),
    next_steps NVARCHAR(MAX),
    rating INT CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints adicionales
    CONSTRAINT CK_interviews_unique_student_project UNIQUE (project_id, student_id),
    CONSTRAINT CK_interviews_outcome_when_completed CHECK (status != 'completed' OR outcome IN ('passed', 'failed'))
);

-- =====================================================
-- ÍNDICES OPTIMIZADOS PARA RENDIMIENTO
-- =====================================================

-- Índices básicos
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = 1;

-- Índices de proyectos
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_api_level ON projects(api_level);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_projects_status_api ON projects(status, api_level);

-- Índices de postulaciones
CREATE INDEX idx_applications_project ON applications(project_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);
CREATE INDEX idx_applications_status_date ON applications(status, applied_at);

-- Índices de evaluaciones
CREATE INDEX idx_evaluations_project ON evaluations(project_id);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_due_date ON evaluations(due_date);
CREATE INDEX idx_evaluations_type_status ON evaluations(type, status);

-- Índices de strikes
CREATE INDEX idx_strikes_student ON strikes(student_id);
CREATE INDEX idx_strikes_status ON strikes(status);
CREATE INDEX idx_strikes_severity ON strikes(severity);
CREATE INDEX idx_strikes_active ON strikes(status) WHERE status = 'active';

-- Índices de notificaciones
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = 0;

-- Índices de horas trabajadas
CREATE INDEX idx_work_hours_student ON work_hours(student_id);
CREATE INDEX idx_work_hours_project ON work_hours(project_id);
CREATE INDEX idx_work_hours_status ON work_hours(status);
CREATE INDEX idx_work_hours_date ON work_hours(date_worked);
CREATE INDEX idx_work_hours_pending ON work_hours(status) WHERE status = 'pending';

-- Índices de entrevistas
CREATE INDEX idx_interviews_project ON interviews(project_id);
CREATE INDEX idx_interviews_student ON interviews(student_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_date);
CREATE INDEX idx_interviews_type_status ON interviews(type, status);

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_students_status_api ON students(status, api_level);
CREATE INDEX idx_students_strikes_status ON students(strikes, status);
CREATE INDEX idx_ratings_project_category ON ratings(project_id, category);
CREATE INDEX idx_evaluation_categories_evaluation ON evaluation_categories(evaluation_id, category_name);

GO

-- =====================================================
-- VISTAS OPTIMIZADAS
-- =====================================================

-- Vista de estadísticas de proyectos con información completa
CREATE VIEW v_project_stats AS
SELECT 
    p.id,
    p.title,
    p.company_id,
    c.company_name,
    p.status,
    p.current_students,
    p.max_students,
    p.applications_count,
    p.api_level,
    p.difficulty,
    p.budget,
    p.total_hours,
    COUNT(a.id) as total_applications,
    COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) as accepted_applications,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_applications,
    AVG(e.overall_rating) as avg_evaluation_rating,
    COUNT(e.id) as total_evaluations,
    p.created_at,
    p.updated_at
FROM projects p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN applications a ON p.id = a.project_id
LEFT JOIN evaluations e ON p.id = e.project_id
GROUP BY p.id, p.title, p.company_id, c.company_name, p.status, p.current_students, p.max_students, 
         p.applications_count, p.api_level, p.difficulty, p.budget, p.total_hours, p.created_at, p.updated_at;

GO

-- Vista de estadísticas de estudiantes con información completa
CREATE VIEW v_student_stats AS
SELECT 
    s.id,
    s.user_id,
    u.name,
    u.email,
    s.career,
    s.semester,
    s.status,
    s.api_level,
    s.strikes,
    s.gpa,
    s.completed_projects,
    s.total_hours,
    s.rating,
    s.experience_years,
    s.availability,
    s.location,
    COUNT(a.id) as total_applications,
    COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) as accepted_applications,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_applications,
    COUNT(e.id) as total_evaluations,
    AVG(e.overall_rating) as avg_evaluation_rating,
    COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_evaluations,
    COUNT(st.id) as total_strikes,
    COUNT(CASE WHEN st.status = 'active' THEN 1 END) as active_strikes,
    s.created_at,
    s.updated_at
FROM students s
JOIN users u ON s.user_id = u.id
LEFT JOIN applications a ON s.id = a.student_id
LEFT JOIN evaluations e ON s.id = e.student_id
LEFT JOIN strikes st ON s.id = st.student_id
GROUP BY s.id, s.user_id, u.name, u.email, s.career, s.semester, s.status, s.api_level, s.strikes, 
         s.gpa, s.completed_projects, s.total_hours, s.rating, s.experience_years, s.availability, 
         s.location, s.created_at, s.updated_at;

GO

-- Vista de evaluaciones completas con información detallada
CREATE VIEW v_evaluations_complete AS
SELECT 
    e.id,
    e.project_id,
    p.title as project_title,
    c.company_name,
    e.student_id,
    u.name as student_name,
    e.evaluator_id,
    evaluator.name as evaluator_name,
    evaluator.role as evaluator_role,
    e.type,
    e.status,
    e.overall_rating,
    e.comments,
    e.strengths,
    e.areas_for_improvement,
    e.due_date,
    e.completed_date,
    p.api_level as project_api_level,
    p.difficulty as project_difficulty,
    e.created_at,
    e.updated_at
FROM evaluations e
JOIN projects p ON e.project_id = p.id
JOIN companies c ON p.company_id = c.id
JOIN students s ON e.student_id = s.id
JOIN users u ON s.user_id = u.id
LEFT JOIN users evaluator ON e.evaluator_id = evaluator.id;

GO

-- Vista de dashboard para administradores
CREATE VIEW v_admin_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'student' AND is_active = 1) as total_students,
    (SELECT COUNT(*) FROM users WHERE role = 'company' AND is_active = 1) as total_companies,
    (SELECT COUNT(*) FROM projects WHERE status = 'open') as open_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'in-progress') as active_projects,
    (SELECT COUNT(*) FROM applications WHERE status = 'pending') as pending_applications,
    (SELECT COUNT(*) FROM evaluations WHERE status = 'pending') as pending_evaluations,
    (SELECT COUNT(*) FROM strikes WHERE status = 'active') as active_strikes,
    (SELECT COUNT(*) FROM notifications WHERE is_read = 0) as unread_notifications,
    (SELECT COUNT(*) FROM students WHERE strikes >= 3) as students_at_risk,
    (SELECT AVG(rating) FROM companies WHERE rating > 0) as avg_company_rating,
    (SELECT AVG(rating) FROM students WHERE rating > 0) as avg_student_rating;

GO

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS OPTIMIZADOS
-- =====================================================

-- Procedimiento para actualizar estadísticas de proyecto
CREATE PROCEDURE sp_UpdateProjectStats
    @project_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE projects 
        SET 
            current_students = (
                SELECT COUNT(*) 
                FROM applications 
                WHERE project_id = @project_id AND status = 'accepted'
            ),
            applications_count = (
                SELECT COUNT(*) 
                FROM applications 
                WHERE project_id = @project_id
            ),
            updated_at = GETDATE()
        WHERE id = @project_id;
        
        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END;

GO

-- Procedimiento para asignar strike a estudiante
CREATE PROCEDURE sp_AssignStrike
    @student_id INT,
    @project_id INT,
    @reported_by INT,
    @type NVARCHAR(20),
    @severity NVARCHAR(20),
    @description NVARCHAR(MAX),
    @evidence NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Validar que el estudiante existe y está activo
        IF NOT EXISTS (SELECT 1 FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = @student_id AND u.is_active = 1)
            THROW 50001, 'Estudiante no encontrado o inactivo', 1;
        
        -- Validar que el proyecto existe
        IF NOT EXISTS (SELECT 1 FROM projects WHERE id = @project_id)
            THROW 50002, 'Proyecto no encontrado', 1;
        
        -- Validar que el reportante existe
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = @reported_by)
            THROW 50003, 'Usuario reportante no encontrado', 1;
        
        -- Insertar el strike
        INSERT INTO strikes (project_id, student_id, reported_by, type, severity, description, evidence)
        VALUES (@project_id, @student_id, @reported_by, @type, @severity, @description, @evidence);
        
        -- Actualizar contador de strikes del estudiante
        UPDATE students 
        SET strikes = strikes + 1, updated_at = GETDATE()
        WHERE id = @student_id;
        
        -- Si el estudiante alcanza 3 strikes, cambiar status a suspended
        UPDATE students 
        SET status = 'suspended', updated_at = GETDATE()
        WHERE id = @student_id AND strikes >= 3;
        
        -- Crear notificación automática
        INSERT INTO notifications (user_id, title, message, type, related_url)
        VALUES (@student_id, 'Strike Asignado', 
                CONCAT('Se te ha asignado un strike por: ', @type, '. Severidad: ', @severity), 
                'warning', '/strikes');
        
        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END;

GO

-- Procedimiento para crear notificación
CREATE PROCEDURE sp_CreateNotification
    @user_id INT,
    @title NVARCHAR(200),
    @message NVARCHAR(MAX),
    @type NVARCHAR(20) = 'info',
    @related_url NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el usuario existe
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = @user_id AND is_active = 1)
            THROW 50004, 'Usuario no encontrado o inactivo', 1;
        
        INSERT INTO notifications (user_id, title, message, type, related_url)
        VALUES (@user_id, @title, @message, @type, @related_url);
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;

GO

-- Procedimiento para aprobar horas trabajadas
CREATE PROCEDURE sp_ApproveWorkHours
    @work_hours_id INT,
    @approved_by INT,
    @status NVARCHAR(20) = 'approved'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Validar que las horas existen
        IF NOT EXISTS (SELECT 1 FROM work_hours WHERE id = @work_hours_id)
            THROW 50005, 'Horas trabajadas no encontradas', 1;
        
        -- Validar que el aprobador es admin o empresa
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = @approved_by AND role IN ('admin', 'company'))
            THROW 50006, 'Usuario no autorizado para aprobar horas', 1;
        
        UPDATE work_hours 
        SET status = @status, approved_by = @approved_by, approved_at = GETDATE()
        WHERE id = @work_hours_id;
        
        -- Si se aprueba, actualizar total de horas del estudiante
        IF @status = 'approved'
        BEGIN
            UPDATE students 
            SET total_hours = total_hours + (
                SELECT hours_worked FROM work_hours WHERE id = @work_hours_id
            ),
            updated_at = GETDATE()
            WHERE id = (
                SELECT student_id FROM work_hours WHERE id = @work_hours_id
            );
        END
        
        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END;

GO

-- Procedimiento para completar proyecto
CREATE PROCEDURE sp_CompleteProject
    @project_id INT,
    @completed_by INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Validar que el proyecto existe y está en progreso
        IF NOT EXISTS (SELECT 1 FROM projects WHERE id = @project_id AND status = 'in-progress')
            THROW 50007, 'Proyecto no encontrado o no está en progreso', 1;
        
        -- Validar que el usuario es admin o empresa del proyecto
        IF NOT EXISTS (
            SELECT 1 FROM projects p 
            JOIN companies c ON p.company_id = c.id 
            WHERE p.id = @project_id AND (c.user_id = @completed_by OR EXISTS (
                SELECT 1 FROM users WHERE id = @completed_by AND role = 'admin'
            ))
        )
            THROW 50008, 'Usuario no autorizado para completar el proyecto', 1;
        
        -- Actualizar estado del proyecto
        UPDATE projects 
        SET status = 'completed', end_date = GETDATE(), updated_at = GETDATE()
        WHERE id = @project_id;
        
        -- Actualizar estado de las postulaciones aceptadas
        UPDATE applications 
        SET status = 'completed', updated_at = GETDATE()
        WHERE project_id = @project_id AND status = 'accepted';
        
        -- Actualizar contadores de estudiantes
        UPDATE students 
        SET completed_projects = completed_projects + 1, updated_at = GETDATE()
        WHERE id IN (
            SELECT student_id FROM applications 
            WHERE project_id = @project_id AND status = 'completed'
        );
        
        -- Crear notificaciones para estudiantes
        INSERT INTO notifications (user_id, title, message, type, related_url)
        SELECT 
            s.user_id,
            'Proyecto Completado',
            CONCAT('El proyecto "', p.title, '" ha sido marcado como completado.'),
            'success',
            CONCAT('/projects/', @project_id)
        FROM applications a
        JOIN students s ON a.student_id = s.id
        JOIN projects p ON a.project_id = p.id
        WHERE a.project_id = @project_id AND a.status = 'completed';
        
        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END;

GO

PRINT 'Esquema de base de datos PULIDO creado exitosamente!';
PRINT 'Base de datos: leanmaker_db';
PRINT 'Tablas creadas: 13';
PRINT 'Vistas creadas: 4';
PRINT 'Procedimientos almacenados: 5';
PRINT 'Índices creados: 35+';
PRINT 'Constraints adicionales: 50+'; 