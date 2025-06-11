-- =====================================================
-- ESQUEMA DE BASE DE DATOS - LEANMAKER
-- SQL Server
-- =====================================================

-- Crear base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'leanmaker_db')
BEGIN
    CREATE DATABASE leanmaker_db;
END
GO

USE leanmaker_db;
GO

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(150) UNIQUE NOT NULL,
    email NVARCHAR(254) UNIQUE NOT NULL,
    password NVARCHAR(128) NOT NULL,
    first_name NVARCHAR(150),
    last_name NVARCHAR(150),
    user_type NVARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'company', 'admin')),
    is_active BIT DEFAULT 1,
    is_staff BIT DEFAULT 0,
    date_joined DATETIME2 DEFAULT GETDATE(),
    last_login DATETIME2,
    avatar_url NVARCHAR(500),
    phone NVARCHAR(20),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE EMPRESAS
-- =====================================================
CREATE TABLE companies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name NVARCHAR(200) NOT NULL,
    description NTEXT,
    industry NVARCHAR(100),
    size NVARCHAR(50),
    website NVARCHAR(200),
    address NTEXT,
    city NVARCHAR(100),
    country NVARCHAR(100),
    founded_year INT,
    logo_url NVARCHAR(500),
    verified BIT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    total_projects INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE ESTUDIANTES
-- =====================================================
CREATE TABLE students (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    university NVARCHAR(200),
    career NVARCHAR(200),
    semester INT,
    graduation_year INT,
    gpa DECIMAL(3,2),
    skills NTEXT, -- JSON array de habilidades
    experience_years INT DEFAULT 0,
    portfolio_url NVARCHAR(500),
    github_url NVARCHAR(500),
    linkedin_url NVARCHAR(500),
    availability NVARCHAR(20) DEFAULT 'flexible',
    location NVARCHAR(200),
    languages NTEXT, -- JSON array de idiomas
    rating DECIMAL(3,2) DEFAULT 0,
    projects_completed INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE PROYECTOS
-- =====================================================
CREATE TABLE projects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE CASCADE,
    title NVARCHAR(200) NOT NULL,
    description NTEXT NOT NULL,
    requirements NTEXT, -- JSON array de requisitos
    skills_required NTEXT, -- JSON array de habilidades
    duration NVARCHAR(100),
    difficulty NVARCHAR(20) DEFAULT 'intermediate',
    api_level INT DEFAULT 1,
    max_students INT DEFAULT 1,
    current_students INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'draft',
    deadline DATE,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE POSTULACIONES
-- =====================================================
CREATE TABLE applications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    status NVARCHAR(20) DEFAULT 'pending',
    cover_letter NTEXT,
    resume_url NVARCHAR(500),
    applied_at DATETIME2 DEFAULT GETDATE(),
    reviewed_at DATETIME2,
    reviewed_by INT FOREIGN KEY REFERENCES users(id),
    notes NTEXT,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE EVALUACIONES
-- =====================================================
CREATE TABLE evaluations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    evaluator_id INT FOREIGN KEY REFERENCES users(id),
    type NVARCHAR(20) DEFAULT 'weekly',
    status NVARCHAR(20) DEFAULT 'pending',
    technical_skills INT CHECK (technical_skills BETWEEN 1 AND 5),
    communication INT CHECK (communication BETWEEN 1 AND 5),
    teamwork INT CHECK (teamwork BETWEEN 1 AND 5),
    problem_solving INT CHECK (problem_solving BETWEEN 1 AND 5),
    overall_rating DECIMAL(3,2),
    comments NTEXT,
    strengths NTEXT, -- JSON array
    areas_for_improvement NTEXT, -- JSON array
    due_date DATE,
    completed_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE ENTREVISTAS
-- =====================================================
CREATE TABLE interviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    interviewer_id INT FOREIGN KEY REFERENCES users(id),
    type NVARCHAR(20) DEFAULT 'technical',
    status NVARCHAR(20) DEFAULT 'scheduled',
    scheduled_date DATETIME2,
    duration INT DEFAULT 60, -- minutos
    location NVARCHAR(200),
    notes NTEXT,
    outcome NVARCHAR(20) DEFAULT 'pending',
    feedback NTEXT,
    next_steps NTEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE STRIKES
-- =====================================================
CREATE TABLE strikes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(id) ON DELETE CASCADE,
    student_id INT FOREIGN KEY REFERENCES students(id) ON DELETE CASCADE,
    reported_by INT FOREIGN KEY REFERENCES users(id),
    type NVARCHAR(20) DEFAULT 'other',
    severity NVARCHAR(20) DEFAULT 'medium',
    description NTEXT NOT NULL,
    evidence NTEXT,
    status NVARCHAR(20) DEFAULT 'active',
    resolution NTEXT,
    resolved_date DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
    title NVARCHAR(200) NOT NULL,
    message NTEXT NOT NULL,
    type NVARCHAR(50) DEFAULT 'info',
    is_read BIT DEFAULT 0,
    related_url NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- TABLA DE CALIFICACIONES BIDIRECCIONALES
-- =====================================================
CREATE TABLE ratings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    rater_id INT FOREIGN KEY REFERENCES users(id),
    rated_id INT FOREIGN KEY REFERENCES users(id),
    project_id INT FOREIGN KEY REFERENCES projects(id),
    rating DECIMAL(3,2) NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NTEXT,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_applications_project ON applications(project_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_evaluations_project ON evaluations(project_id);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_interviews_project ON interviews(project_id);
CREATE INDEX idx_interviews_student ON interviews(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- =====================================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- =====================================================
GO

CREATE TRIGGER tr_users_updated_at
ON users
AFTER UPDATE
AS
BEGIN
    UPDATE users 
    SET updated_at = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END
GO

CREATE TRIGGER tr_projects_updated_at
ON projects
AFTER UPDATE
AS
BEGIN
    UPDATE projects 
    SET updated_at = GETDATE()
    FROM projects p
    INNER JOIN inserted i ON p.id = i.id;
END
GO

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================
GO

CREATE VIEW v_project_stats AS
SELECT 
    p.id,
    p.title,
    p.status,
    p.applications_count,
    p.current_students,
    p.max_students,
    c.company_name,
    c.rating as company_rating
FROM projects p
JOIN companies c ON p.company_id = c.id;
GO

CREATE VIEW v_student_stats AS
SELECT 
    s.id,
    u.first_name + ' ' + u.last_name as full_name,
    s.university,
    s.career,
    s.rating,
    s.projects_completed,
    s.experience_years
FROM students s
JOIN users u ON s.user_id = u.id;
GO

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================
GO

CREATE PROCEDURE sp_GetProjectApplications
    @ProjectId INT
AS
BEGIN
    SELECT 
        a.id,
        a.status,
        a.applied_at,
        s.id as student_id,
        u.first_name + ' ' + u.last_name as student_name,
        u.email as student_email,
        s.university,
        s.career,
        s.rating as student_rating
    FROM applications a
    JOIN students s ON a.student_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE a.project_id = @ProjectId
    ORDER BY a.applied_at DESC;
END
GO

CREATE PROCEDURE sp_UpdateProjectStats
    @ProjectId INT
AS
BEGIN
    UPDATE projects 
    SET 
        applications_count = (SELECT COUNT(*) FROM applications WHERE project_id = @ProjectId),
        current_students = (SELECT COUNT(*) FROM applications WHERE project_id = @ProjectId AND status = 'accepted'),
        updated_at = GETDATE()
    WHERE id = @ProjectId;
END
GO 