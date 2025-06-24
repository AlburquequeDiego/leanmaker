-- =====================================================
-- DATOS DE EJEMPLO - LEANMAKER (VERSIÓN UNIFICADA)
-- SQL Server - Compatible con el esquema unificado
-- =====================================================

USE leanmaker_db;
GO

-- =====================================================
-- LIMPIEZA DE DATOS EXISTENTES
-- =====================================================
-- PRINT 'Limpiando datos existentes...';

-- Eliminar datos en orden inverso de dependencias
DELETE FROM data_backups;
DELETE FROM reports;
DELETE FROM platform_config;
DELETE FROM activity_logs;
DELETE FROM notification_preferences;
DELETE FROM documents;
DELETE FROM calendar_events;
DELETE FROM interviews;
DELETE FROM disciplinary_records;
DELETE FROM mass_notifications;
DELETE FROM notifications;
DELETE FROM strikes;
DELETE FROM ratings;
DELETE FROM evaluations;
DELETE FROM work_hours;
DELETE FROM assignments;
DELETE FROM applications;
DELETE FROM project_status_history;
DELETE FROM projects;
DELETE FROM students;
DELETE FROM companies;
DELETE FROM admins;
DELETE FROM users;
GO

-- Reiniciar contadores de identidad
DBCC CHECKIDENT ('data_backups', RESEED, 0);
DBCC CHECKIDENT ('reports', RESEED, 0);
DBCC CHECKIDENT ('platform_config', RESEED, 0);
DBCC CHECKIDENT ('activity_logs', RESEED, 0);
DBCC CHECKIDENT ('notification_preferences', RESEED, 0);
DBCC CHECKIDENT ('documents', RESEED, 0);
DBCC CHECKIDENT ('calendar_events', RESEED, 0);
DBCC CHECKIDENT ('interviews', RESEED, 0);
DBCC CHECKIDENT ('disciplinary_records', RESEED, 0);
DBCC CHECKIDENT ('mass_notifications', RESEED, 0);
DBCC CHECKIDENT ('notifications', RESEED, 0);
DBCC CHECKIDENT ('strikes', RESEED, 0);
DBCC CHECKIDENT ('ratings', RESEED, 0);
DBCC CHECKIDENT ('evaluations', RESEED, 0);
DBCC CHECKIDENT ('work_hours', RESEED, 0);
DBCC CHECKIDENT ('assignments', RESEED, 0);
DBCC CHECKIDENT ('applications', RESEED, 0);
DBCC CHECKIDENT ('project_status_history', RESEED, 0);
DBCC CHECKIDENT ('projects', RESEED, 0);
DBCC CHECKIDENT ('students', RESEED, 0);
DBCC CHECKIDENT ('companies', RESEED, 0);
DBCC CHECKIDENT ('admins', RESEED, 0);
DBCC CHECKIDENT ('users', RESEED, 0);
GO

-- PRINT 'Datos limpiados correctamente.';
-- GO

-- =====================================================
-- INSERTAR USUARIOS DE PRUEBA
-- =====================================================
SET IDENTITY_INSERT users ON;
INSERT INTO users (id, email, password, role, name, is_active, is_staff) VALUES
(1, 'admin@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'admin', 'Administrador Principal', 1, 1),
(2, 'supervisor@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'admin', 'Supervisor General', 1, 1),
(3, 'empresa@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Ana Contreras', 1, 0),
(4, 'rrhh@innovatech.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Luis Valdés', 1, 0),
(5, 'manager@datasciencecorp.io', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Elena Ríos', 1, 0),
(6, 'admin@cybersecure.cl', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Pedro Pascal', 1, 0),
(7, 'info@mobilefirst.dev', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Sofia Vergara', 1, 0),
(8, 'hola@webmasters.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Arturo Vidal', 1, 0),
(9, 'jobs@cloudservices.net', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Gabriela Mistral', 1, 0),
(10, 'support@fintechglobal.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Pablo Neruda', 1, 0),
(11, 'contact@healthtech.co', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Isabel Allende', 1, 0),
(12, 'hiring@gamestudios.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Marcelo Salas', 1, 0),
(13, 'estudiante@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Juan Pérez', 1, 0),
(14, 'maria.gomez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'María Gómez', 1, 0),
(15, 'carlos.lopez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Carlos López', 1, 0),
(16, 'ana.martinez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Ana Martínez', 1, 0),
(17, 'diego.hernandez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Diego Hernández', 1, 0),
(18, 'sofia.garcia@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Sofía García', 1, 0),
(19, 'javier.diaz@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Javier Díaz', 1, 0),
(20, 'laura.fernandez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Laura Fernández', 1, 0),
(21, 'pablo.moreno@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Pablo Moreno', 1, 0),
(22, 'valentina.romero@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Valentina Romero', 1, 0);
SET IDENTITY_INSERT users OFF;

-- PRINT 'Usuarios insertados correctamente.';
-- GO

-- =====================================================
-- INSERTAR PERFILES ESPECÍFICOS
-- =====================================================
SET IDENTITY_INSERT admins ON;
INSERT INTO admins (id, user_id, permissions) VALUES 
(1, 1, '["full_access", "user_management", "project_approval", "reports"]'),
(2, 2, '["review_access", "project_monitoring", "basic_reports"]');
SET IDENTITY_INSERT admins OFF;

-- =====================================================
-- INSERTAR EMPRESAS
-- =====================================================
SET IDENTITY_INSERT companies ON;
INSERT INTO companies (id, user_id, company_name, industry, size, description, website, location, founded_year, contact_email, contact_phone, status, rating, projects_completed, total_hours_offered, technologies_used, benefits_offered, remote_work_policy, internship_duration, stipend_range) VALUES
(1, 3, 'Tech Solutions Chile', 'Tecnología', 'medium', 'Empresa líder en desarrollo de software empresarial con más de 10 años de experiencia', 'https://techsolutions.cl', 'Santiago, Chile', 2014, 'empresa@leanmaker.com', '+56 2 2345 6789', 'active', 4.8, 15, 1200, '["React", "Node.js", "Python", "AWS"]', '["Capacitación", "Horario flexible", "Trabajo remoto"]', 'híbrido', 6, '500000-800000'),
(2, 4, 'InnovaTech', 'Tecnología', 'large', 'Startup innovadora enfocada en inteligencia artificial y machine learning', 'https://innovatech.com', 'Valparaíso, Chile', 2020, 'rrhh@innovatech.com', '+56 32 1234 5678', 'active', 4.6, 8, 800, '["Python", "TensorFlow", "Docker", "Kubernetes"]', '["Mentoría", "Stock options", "Gimnasio"]', 'remoto', 4, '600000-900000'),
(3, 5, 'Data Science Corp', 'Consultoría', 'medium', 'Consultora especializada en análisis de datos y business intelligence', 'https://datasciencecorp.io', 'Santiago, Chile', 2018, 'manager@datasciencecorp.io', '+56 2 3456 7890', 'active', 4.7, 12, 1000, '["Python", "R", "SQL", "Power BI"]', '["Capacitación", "Horario flexible"]', 'presencial', 5, '400000-700000'),
(4, 6, 'CyberSecure', 'Ciberseguridad', 'small', 'Empresa especializada en seguridad informática y auditorías de sistemas', 'https://cybersecure.cl', 'Concepción, Chile', 2021, 'admin@cybersecure.cl', '+56 41 2345 6789', 'active', 4.5, 6, 500, '["Python", "Linux", "Wireshark", "Metasploit"]', '["Certificaciones", "Horario flexible"]', 'híbrido', 3, '300000-500000'),
(5, 7, 'Mobile First', 'Desarrollo Móvil', 'medium', 'Desarrolladora de aplicaciones móviles nativas y multiplataforma', 'https://mobilefirst.dev', 'Santiago, Chile', 2019, 'info@mobilefirst.dev', '+56 2 4567 8901', 'active', 4.4, 10, 900, '["React Native", "Flutter", "Swift", "Kotlin"]', '["Equipo nuevo", "Horario flexible"]', 'híbrido', 4, '450000-750000'),
(6, 8, 'WebMasters', 'Desarrollo Web', 'small', 'Agencia digital especializada en diseño y desarrollo web moderno', 'https://webmasters.com', 'Valparaíso, Chile', 2022, 'hola@webmasters.com', '+56 32 2345 6789', 'active', 4.3, 4, 300, '["React", "Vue.js", "Laravel", "WordPress"]', '["Capacitación", "Horario flexible"]', 'remoto', 3, '350000-550000'),
(7, 9, 'Cloud Services', 'Cloud Computing', 'large', 'Proveedor de servicios en la nube y consultoría de infraestructura', 'https://cloudservices.net', 'Santiago, Chile', 2017, 'jobs@cloudservices.net', '+56 2 5678 9012', 'active', 4.6, 18, 1500, '["AWS", "Azure", "GCP", "Terraform"]', '["Certificaciones", "Stock options", "Gimnasio"]', 'híbrido', 6, '600000-900000'),
(8, 10, 'FinTech Global', 'Fintech', 'medium', 'Empresa de tecnología financiera enfocada en pagos digitales', 'https://fintechglobal.com', 'Santiago, Chile', 2020, 'support@fintechglobal.com', '+56 2 6789 0123', 'active', 4.5, 9, 750, '["Java", "Spring", "PostgreSQL", "Redis"]', '["Capacitación", "Horario flexible"]', 'presencial', 5, '500000-800000'),
(9, 11, 'HealthTech', 'Salud Digital', 'small', 'Startup de tecnología médica y aplicaciones de salud', 'https://healthtech.co', 'Concepción, Chile', 2023, 'contact@healthtech.co', '+56 41 3456 7890', 'active', 4.2, 3, 200, '["Python", "Django", "React", "PostgreSQL"]', '["Capacitación", "Horario flexible"]', 'híbrido', 4, '400000-600000'),
(10, 12, 'Game Studios', 'Gaming', 'medium', 'Desarrolladora de videojuegos independientes', 'https://gamestudios.com', 'Santiago, Chile', 2021, 'hiring@gamestudios.com', '+56 2 7890 1234', 'active', 4.4, 7, 600, '["Unity", "C#", "Blender", "Photoshop"]', '["Equipo nuevo", "Horario flexible", "Gimnasio"]', 'presencial', 4, '450000-700000');
SET IDENTITY_INSERT companies OFF;

-- =====================================================
-- INSERTAR ESTUDIANTES
-- =====================================================
SET IDENTITY_INSERT students ON;
INSERT INTO students (id, user_id, career, semester, graduation_year, status, api_level, strikes, gpa, completed_projects, total_hours, skills, experience_years, portfolio_url, github_url, linkedin_url, availability, location, languages, rating) VALUES
(1, 13, 'Ingeniería Civil en Informática', 8, 2025, 'approved', 3, 0, 6.2, 2, 240, '["React", "TypeScript", "Node.js", "MongoDB"]', 1, 'https://portfolio.com/jp', 'https://github.com/jp', 'https://linkedin.com/in/jp', 'full-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.5),
(2, 14, 'Ingeniería Civil en Computación', 6, 2026, 'approved', 2, 1, 5.8, 1, 120, '["Python", "Django", "PostgreSQL", "Docker"]', 1, 'https://portfolio.com/mg', 'https://github.com/mg', NULL, 'part-time', 'Valparaíso, Chile', '["Español"]', 4.2),
(3, 15, 'Ingeniería en Informática', 9, 2024, 'suspended', 4, 3, 6.5, 4, 400, '["Java", "Spring", "AWS", "Kubernetes"]', 3, 'https://portfolio.com/cl', 'https://github.com/cl', 'https://linkedin.com/in/cl', 'flexible', 'Concepción, Chile', '["Español", "Inglés"]', 4.8),
(4, 16, 'Diseño Gráfico', 7, 2025, 'approved', 2, 0, 6.0, 1, 80, '["Figma", "Illustrator", "Photoshop", "After Effects"]', 1, 'https://portfolio.com/am', NULL, NULL, 'part-time', 'Santiago, Chile', '["Español"]', 4.1),
(5, 17, 'Periodismo', 8, 2025, 'approved', 1, 0, 5.9, 0, 40, '["Redacción", "SEO", "Wordpress", "Analytics"]', 2, NULL, NULL, NULL, 'flexible', 'Valparaíso, Chile', '["Español"]', 4.0),
(6, 18, 'Ingeniería Comercial', 10, 2024, 'approved', 3, 0, 6.4, 3, 300, '["Excel", "Power BI", "SQL", "Tableau"]', 2, NULL, NULL, 'https://linkedin.com/in/dh', 'full-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.7),
(7, 19, 'Ingeniería Civil Industrial', 8, 2025, 'approved', 2, 0, 6.1, 1, 150, '["Python", "Project", "Excel", "R"]', 1, NULL, NULL, NULL, 'part-time', 'Santiago, Chile', '["Español"]', 4.3),
(8, 20, 'Psicología', 9, 2024, 'approved', 1, 1, 6.3, 0, 60, '["Investigación", "SPSS", "Excel", "Qualtrics"]', 1, NULL, NULL, NULL, 'flexible', 'Concepción, Chile', '["Español"]', 4.4),
(9, 21, 'Ingeniería Civil en Informática', 7, 2026, 'approved', 2, 0, 6.0, 1, 100, '["Vue.js", "Laravel", "MySQL", "Docker"]', 1, 'https://portfolio.com/pm', 'https://github.com/pm', NULL, 'part-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.2),
(10, 22, 'Ingeniería en Computación', 8, 2025, 'approved', 3, 0, 6.3, 2, 180, '["Angular", "Java", "Spring Boot", "PostgreSQL"]', 2, 'https://portfolio.com/vr', 'https://github.com/vr', 'https://linkedin.com/in/vr', 'full-time', 'Valparaíso, Chile', '["Español", "Inglés"]', 4.6);
SET IDENTITY_INSERT students OFF;

PRINT 'Perfiles específicos insertados correctamente.';
GO

-- =====================================================
-- INSERTAR PROYECTOS DE EJEMPLO
-- =====================================================
SET IDENTITY_INSERT projects ON;
INSERT INTO projects (id, company_id, status_id, area_id, title, description, trl_id, api_level, required_hours, start_date, estimated_end_date) VALUES
(1, 1, 2, 2, 'Plataforma E-commerce React', 'Desarrollo de una plataforma completa de e-commerce con React, Node.js y MongoDB. Incluye carrito de compras, pasarela de pagos y panel administrativo.', 5, 3, 200, '2024-08-01', '2024-12-01'),
(2, 2, 3, 4, 'Motor de Recomendaciones IA', 'Crear un motor de recomendaciones inteligente usando Python, TensorFlow y algoritmos de machine learning para personalizar experiencias de usuario.', 7, 4, 300, '2024-07-15', '2024-11-15'),
(3, 3, 2, 3, 'Dashboard de Analytics', 'Desarrollo de un dashboard interactivo para visualización de datos de ventas y métricas empresariales usando Power BI y SQL Server.', 6, 3, 150, '2024-09-01', '2024-11-01'),
(4, 5, 2, 2, 'App de Telemedicina', 'Aplicación móvil para consultas médicas remotas con React Native, incluyendo videollamadas, chat y gestión de citas.', 8, 4, 250, '2024-08-15', '2024-12-15');
SET IDENTITY_INSERT projects OFF;

PRINT 'Proyectos insertados correctamente.';
GO

-- =====================================================
-- INSERTAR POSTULACIONES Y ASIGNACIONES
-- =====================================================
SET IDENTITY_INSERT applications ON;
INSERT INTO applications (id, project_id, student_id, status, fecha_postulacion) VALUES 
(1, 1, 13, 'accepted', '2024-07-25'), -- Juan a Tech Solutions
(2, 2, 14, 'accepted', '2024-07-10'), -- María a InnovaTech
(3, 3, 18, 'pending', '2024-08-20'),  -- Diego a Data Science Corp
(4, 4, 16, 'pending', '2024-08-10'),  -- Ana a Mobile First
(5, 1, 19, 'rejected', '2024-07-26'); -- Javier a Tech Solutions
SET IDENTITY_INSERT applications OFF;

-- =====================================================
-- INSERTAR ASIGNACIONES
-- =====================================================
SET IDENTITY_INSERT assignments ON;
INSERT INTO assignments (id, project_id, student_id, company_id, status, start_date, end_date, hours_per_week, total_hours, stipend, description, mentor_id, progress_percentage, feedback, created_at) VALUES
(1, 1, 13, 1, 'active', '2024-08-01', '2024-10-31', 20, 240, 600000, 'Desarrollo frontend con React y TypeScript para plataforma e-commerce', 3, 75, 'Excelente progreso en el desarrollo de componentes', '2024-07-25'),
(2, 2, 14, 2, 'active', '2024-07-15', '2024-09-15', 25, 200, 700000, 'Implementación de algoritmos de machine learning para sistema de recomendaciones', 4, 60, 'Muy buen manejo de las librerías de ML', '2024-07-10'),
(3, 3, 18, 3, 'pending', '2024-09-01', '2024-11-30', 30, 360, 800000, 'Análisis de datos y creación de dashboards con Power BI', 5, 0, NULL, '2024-08-20'),
(4, 4, 16, 5, 'pending', '2024-09-15', '2024-12-15', 20, 240, 500000, 'Desarrollo de aplicación móvil con React Native', 7, 0, NULL, '2024-08-10');
SET IDENTITY_INSERT assignments OFF;

PRINT 'Postulaciones y asignaciones insertadas correctamente.';
GO

-- =====================================================
-- INSERTAR HORAS TRABAJADAS
-- =====================================================
SET IDENTITY_INSERT work_hours ON;
INSERT INTO work_hours (id, assignment_id, student_id, project_id, company_id, fecha, horas_trabajadas, descripcion, estado_validacion) VALUES
(1, 1, 13, 1, 1, '2024-08-05', 8, 'Configuración del proyecto React, instalación de dependencias y estructura inicial', 'aprobado'),
(2, 1, 13, 1, 1, '2024-08-06', 6, 'Desarrollo de componentes básicos y navegación', 'aprobado'),
(3, 1, 13, 1, 1, '2024-08-07', 7, 'Implementación del carrito de compras y gestión de estado', 'aprobado'),
(4, 2, 14, 2, 2, '2024-07-16', 8, 'Análisis de datos de usuarios y preparación del dataset', 'aprobado'),
(5, 2, 14, 2, 2, '2024-07-17', 6, 'Implementación del algoritmo de recomendaciones básico', 'aprobado');
SET IDENTITY_INSERT work_hours OFF;

-- =====================================================
-- INSERTAR EVALUACIONES
-- =====================================================
SET IDENTITY_INSERT evaluations ON;
INSERT INTO evaluations (id, student_id, project_id, evaluator_id, category_id, score, comments, evaluation_date) VALUES
(1, 13, 1, 3, 1, 8.5, 'Excelente calidad de código y documentación. Muy buen manejo de React y TypeScript.', '2024-08-10'),
(2, 13, 1, 3, 2, 9.0, 'Siempre cumple con los plazos establecidos y entrega antes de lo esperado.', '2024-08-10'),
(3, 13, 1, 3, 3, 8.0, 'Buena comunicación con el equipo y reportes claros de progreso.', '2024-08-10'),
(4, 14, 2, 4, 1, 9.0, 'Implementación excepcional del algoritmo de ML. Código muy limpio y eficiente.', '2024-07-20'),
(5, 14, 2, 4, 2, 8.5, 'Cumple con todos los deadlines y maneja bien las prioridades.', '2024-07-20');
SET IDENTITY_INSERT evaluations OFF;

-- =====================================================
-- INSERTAR NOTIFICACIONES
-- =====================================================
SET IDENTITY_INSERT notifications ON;
INSERT INTO notifications (id, user_id, title, message, notification_type, is_read, created_at) VALUES
(1, 1, 'Nuevo proyecto publicado', 'Se ha publicado un nuevo proyecto: "Plataforma E-commerce React"', 'project_alert', 0, '2024-07-25'),
(2, 13, 'Postulación aceptada', 'Tu postulación al proyecto "Motor de Recomendaciones IA" ha sido aceptada', 'application_status', 0, '2024-07-15'),
(3, 19, 'Evaluación completada', 'Se ha completado la evaluación de tu trabajo en el proyecto "Dashboard de Analytics"', 'evaluation', 0, '2024-08-30'),
(4, 3, 'Nueva postulación', 'Has recibido una nueva postulación de Juan Pérez para tu proyecto', 'application_received', 0, '2024-07-25');
SET IDENTITY_INSERT notifications OFF;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
PRINT '';
PRINT '=== VERIFICACIÓN DE DATOS INSERTADOS ===';

-- Verificar usuarios insertados
DECLARE @user_count INT = 0;
SELECT @user_count = COUNT(*) FROM users;
PRINT 'Usuarios insertados: ' + CAST(@user_count AS VARCHAR(10));

-- Verificar empresas insertadas
DECLARE @company_count INT = 0;
SELECT @company_count = COUNT(*) FROM companies;
PRINT 'Empresas insertadas: ' + CAST(@company_count AS VARCHAR(10));

-- Verificar estudiantes insertados
DECLARE @student_count INT = 0;
SELECT @student_count = COUNT(*) FROM students;
PRINT 'Estudiantes insertados: ' + CAST(@student_count AS VARCHAR(10));

-- Verificar proyectos insertados
DECLARE @project_count INT = 0;
SELECT @project_count = COUNT(*) FROM projects;
PRINT 'Proyectos insertados: ' + CAST(@project_count AS VARCHAR(10));

-- Verificar postulaciones insertadas
DECLARE @application_count INT = 0;
SELECT @application_count = COUNT(*) FROM applications;
PRINT 'Postulaciones insertadas: ' + CAST(@application_count AS VARCHAR(10));

-- Verificar horas trabajadas
DECLARE @hours_count INT = 0;
SELECT @hours_count = COUNT(*) FROM work_hours;
PRINT 'Registros de horas insertados: ' + CAST(@hours_count AS VARCHAR(10));

-- Verificar evaluaciones
DECLARE @evaluation_count INT = 0;
SELECT @evaluation_count = COUNT(*) FROM evaluations;
PRINT 'Evaluaciones insertadas: ' + CAST(@evaluation_count AS VARCHAR(10));

PRINT '';
PRINT '=== DATOS DE EJEMPLO INSERTADOS EXITOSAMENTE ===';
PRINT 'La base de datos está lista para pruebas y desarrollo.';
PRINT '';
PRINT 'Credenciales de prueba:';
PRINT '- Admin: admin@leanmaker.com / Admin123!';
PRINT '- Empresa: empresa@leanmaker.com / Empresa123!';
PRINT '- Estudiante: estudiante@leanmaker.com / Estudiante123!';
PRINT '';
PRINT 'Nota: Los datos de configuración (TRL, áreas, estados) ya están en schema.sql';
PRINT '';
PRINT '=== RESUMEN DE DATOS INSERTADOS ===';
PRINT '- 15 usuarios (2 admins, 5 empresas, 8 estudiantes)';
PRINT '- 4 proyectos activos';
PRINT '- 5 postulaciones (2 aceptadas, 2 pendientes, 1 rechazada)';
PRINT '- 4 asignaciones en curso';
PRINT '- 5 registros de horas trabajadas';
PRINT '- 5 evaluaciones completadas';
PRINT '- 4 notificaciones';
PRINT '';
PRINT 'Script completado exitosamente!';
GO 