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

-- Administradores
INSERT INTO users (id, email, password, role, first_name, last_name, username, phone, avatar, bio, is_active, is_staff, is_superuser, is_verified, date_joined, last_login) VALUES
(NEWID(), 'admin@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'admin', 'Carlos', 'Rodríguez', 'admin_principal', '+56 9 1234 5678', 'https://avatars.githubusercontent.com/u/1', 'Administrador principal de la plataforma LeanMaker', 1, 1, 1, 1, '2024-01-15', '2024-08-15'),
(NEWID(), 'supervisor@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'admin', 'María', 'González', 'supervisor_general', '+56 9 2345 6789', 'https://avatars.githubusercontent.com/u/2', 'Supervisor general de operaciones', 1, 1, 0, 1, '2024-02-01', '2024-08-14');

-- Empresas
INSERT INTO users (id, email, password, role, first_name, last_name, username, phone, avatar, bio, is_active, is_staff, is_superuser, is_verified, date_joined, last_login) VALUES
(NEWID(), 'techsolutions@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Ana', 'Contreras', 'ana_contreras', '+56 9 3456 7890', 'https://avatars.githubusercontent.com/u/3', 'CEO de Tech Solutions Chile', 1, 0, 0, 1, '2024-01-20', '2024-08-15'),
(NEWID(), 'innovatech@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Luis', 'Valdés', 'luis_valdes', '+56 9 4567 8901', 'https://avatars.githubusercontent.com/u/4', 'CTO de InnovaTech', 1, 0, 0, 1, '2024-02-10', '2024-08-14'),
(NEWID(), 'datascience@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Elena', 'Ríos', 'elena_rios', '+56 9 5678 9012', 'https://avatars.githubusercontent.com/u/5', 'Directora de Data Science Corp', 1, 0, 0, 1, '2024-01-25', '2024-08-13'),
(NEWID(), 'cybersecure@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Pedro', 'Pascal', 'pedro_pascal', '+56 9 6789 0123', 'https://avatars.githubusercontent.com/u/6', 'Fundador de CyberSecure', 1, 0, 0, 1, '2024-03-01', '2024-08-12'),
(NEWID(), 'mobilefirst@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Sofia', 'Vergara', 'sofia_vergara', '+56 9 7890 1234', 'https://avatars.githubusercontent.com/u/7', 'CEO de Mobile First', 1, 0, 0, 1, '2024-02-15', '2024-08-11'),
(NEWID(), 'webmasters@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Arturo', 'Vidal', 'arturo_vidal', '+56 9 8901 2345', 'https://avatars.githubusercontent.com/u/8', 'Director de WebMasters', 1, 0, 0, 1, '2024-01-30', '2024-08-10'),
(NEWID(), 'cloudservices@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Gabriela', 'Mistral', 'gabriela_mistral', '+56 9 9012 3456', 'https://avatars.githubusercontent.com/u/9', 'CTO de Cloud Services', 1, 0, 0, 1, '2024-02-05', '2024-08-09'),
(NEWID(), 'fintechglobal@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Pablo', 'Neruda', 'pablo_neruda', '+56 9 0123 4567', 'https://avatars.githubusercontent.com/u/10', 'CEO de FinTech Global', 1, 0, 0, 1, '2024-01-10', '2024-08-08'),
(NEWID(), 'healthtech@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Isabel', 'Allende', 'isabel_allende', '+56 9 1234 5679', 'https://avatars.githubusercontent.com/u/11', 'Fundadora de HealthTech', 1, 0, 0, 1, '2024-03-15', '2024-08-07'),
(NEWID(), 'gamestudios@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Marcelo', 'Salas', 'marcelo_salas', '+56 9 2345 6780', 'https://avatars.githubusercontent.com/u/12', 'Director de Game Studios', 1, 0, 0, 1, '2024-02-20', '2024-08-06');

-- Estudiantes
INSERT INTO users (id, email, password, role, first_name, last_name, username, phone, avatar, bio, is_active, is_staff, is_superuser, is_verified, date_joined, last_login) VALUES
(NEWID(), 'juan.perez@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Juan', 'Pérez', 'juan_perez', '+56 9 3456 7891', 'https://avatars.githubusercontent.com/u/13', 'Estudiante de Ingeniería Civil en Informática', 1, 0, 0, 1, '2024-01-05', '2024-08-15'),
(NEWID(), 'maria.gomez@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'María', 'Gómez', 'maria_gomez', '+56 9 4567 8902', 'https://avatars.githubusercontent.com/u/14', 'Estudiante de Ingeniería Civil en Computación', 1, 0, 0, 1, '2024-01-12', '2024-08-14'),
(NEWID(), 'carlos.lopez@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Carlos', 'López', 'carlos_lopez', '+56 9 5678 9013', 'https://avatars.githubusercontent.com/u/15', 'Estudiante de Ingeniería en Informática', 1, 0, 0, 1, '2024-01-08', '2024-08-13'),
(NEWID(), 'ana.martinez@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Ana', 'Martínez', 'ana_martinez', '+56 9 6789 0124', 'https://avatars.githubusercontent.com/u/16', 'Estudiante de Diseño Gráfico', 1, 0, 0, 1, '2024-01-15', '2024-08-12'),
(NEWID(), 'diego.hernandez@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Diego', 'Hernández', 'diego_hernandez', '+56 9 7890 1235', 'https://avatars.githubusercontent.com/u/17', 'Estudiante de Periodismo', 1, 0, 0, 1, '2024-01-20', '2024-08-11'),
(NEWID(), 'sofia.garcia@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Sofía', 'García', 'sofia_garcia', '+56 9 8901 2346', 'https://avatars.githubusercontent.com/u/18', 'Estudiante de Ingeniería Comercial', 1, 0, 0, 1, '2024-01-25', '2024-08-10'),
(NEWID(), 'javier.diaz@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Javier', 'Díaz', 'javier_diaz', '+56 9 9012 3457', 'https://avatars.githubusercontent.com/u/19', 'Estudiante de Ingeniería Civil Industrial', 1, 0, 0, 1, '2024-02-01', '2024-08-09'),
(NEWID(), 'laura.fernandez@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Laura', 'Fernández', 'laura_fernandez', '+56 9 0123 4568', 'https://avatars.githubusercontent.com/u/20', 'Estudiante de Psicología', 1, 0, 0, 1, '2024-02-05', '2024-08-08'),
(NEWID(), 'pablo.moreno@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Pablo', 'Moreno', 'pablo_moreno', '+56 9 1234 5679', 'https://avatars.githubusercontent.com/u/21', 'Estudiante de Ingeniería Civil en Informática', 1, 0, 0, 1, '2024-02-10', '2024-08-07'),
(NEWID(), 'valentina.romero@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Valentina', 'Romero', 'valentina_romero', '+56 9 2345 6780', 'https://avatars.githubusercontent.com/u/22', 'Estudiante de Ingeniería en Computación', 1, 0, 0, 1, '2024-02-15', '2024-08-06');

GO

-- =====================================================
-- INSERTAR PERFILES ESPECÍFICOS
-- =====================================================

-- Obtener IDs de usuarios para admins
DECLARE @admin1_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'admin@leanmaker.com');
DECLARE @admin2_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'supervisor@leanmaker.com');

INSERT INTO admins (user_id, permissions) VALUES 
(@admin1_id, '["full_access", "user_management", "project_approval", "reports"]'),
(@admin2_id, '["review_access", "project_monitoring", "basic_reports"]');

-- =====================================================
-- INSERTAR EMPRESAS
-- =====================================================

-- Obtener IDs de usuarios para empresas
DECLARE @techsolutions_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'techsolutions@leanmaker.com');
DECLARE @innovatech_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'innovatech@leanmaker.com');
DECLARE @datascience_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'datascience@leanmaker.com');
DECLARE @cybersecure_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'cybersecure@leanmaker.com');
DECLARE @mobilefirst_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'mobilefirst@leanmaker.com');
DECLARE @webmasters_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'webmasters@leanmaker.com');
DECLARE @cloudservices_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'cloudservices@leanmaker.com');
DECLARE @fintechglobal_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'fintechglobal@leanmaker.com');
DECLARE @healthtech_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'healthtech@leanmaker.com');
DECLARE @gamestudios_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'gamestudios@leanmaker.com');

INSERT INTO companies (user_id, company_name, industry, size, description, website, address, city, country, founded_year, logo_url, verified, rating, total_projects, projects_completed, total_hours_offered, technologies_used, benefits_offered, remote_work_policy, internship_duration, stipend_range, contact_email, contact_phone, status) VALUES
(@techsolutions_id, 'Tech Solutions Chile', 'Tecnología', 'Mediana', 'Empresa líder en desarrollo de software empresarial con más de 10 años de experiencia', 'https://techsolutions.cl', 'Av. Providencia 1234', 'Santiago', 'Chile', 2014, 'https://techsolutions.cl/logo.png', 1, 4.8, 15, 12, 1200, '["React", "Node.js", "Python", "AWS"]', '["Capacitación", "Horario flexible", "Trabajo remoto"]', 'hybrid', '6 meses', '500000-800000', 'techsolutions@leanmaker.com', '+56 2 2345 6789', 'active'),
(@innovatech_id, 'InnovaTech', 'Tecnología', 'Grande', 'Startup innovadora enfocada en inteligencia artificial y machine learning', 'https://innovatech.com', 'Av. Brasil 567', 'Valparaíso', 'Chile', 2020, 'https://innovatech.com/logo.png', 1, 4.6, 8, 6, 800, '["Python", "TensorFlow", "Docker", "Kubernetes"]', '["Mentoría", "Stock options", "Gimnasio"]', 'full-remote', '4 meses', '600000-900000', 'innovatech@leanmaker.com', '+56 32 1234 5678', 'active'),
(@datascience_id, 'Data Science Corp', 'Consultoría', 'Mediana', 'Consultora especializada en análisis de datos y business intelligence', 'https://datasciencecorp.io', 'Av. Las Condes 890', 'Santiago', 'Chile', 2018, 'https://datasciencecorp.io/logo.png', 1, 4.7, 12, 10, 1000, '["Python", "R", "SQL", "Power BI"]', '["Capacitación", "Horario flexible"]', 'onsite', '5 meses', '400000-700000', 'datascience@leanmaker.com', '+56 2 3456 7890', 'active'),
(@cybersecure_id, 'CyberSecure', 'Ciberseguridad', 'Pequeña', 'Empresa especializada en seguridad informática y auditorías de sistemas', 'https://cybersecure.cl', 'Av. OHiggins 456', 'Concepción', 'Chile', 2021, 'https://cybersecure.cl/logo.png', 0, 4.5, 6, 4, 500, '["Python", "Linux", "Wireshark", "Metasploit"]', '["Certificaciones", "Horario flexible"]', 'hybrid', '3 meses', '300000-500000', 'cybersecure@leanmaker.com', '+56 41 2345 6789', 'active'),
(@mobilefirst_id, 'Mobile First', 'Desarrollo Móvil', 'Mediana', 'Desarrolladora de aplicaciones móviles nativas y multiplataforma', 'https://mobilefirst.dev', 'Av. Vitacura 234', 'Santiago', 'Chile', 2019, 'https://mobilefirst.dev/logo.png', 1, 4.4, 10, 8, 900, '["React Native", "Flutter", "Swift", "Kotlin"]', '["Equipo nuevo", "Horario flexible"]', 'hybrid', '4 meses', '450000-750000', 'mobilefirst@leanmaker.com', '+56 2 4567 8901', 'active'),
(@webmasters_id, 'WebMasters', 'Desarrollo Web', 'Pequeña', 'Agencia digital especializada en diseño y desarrollo web moderno', 'https://webmasters.com', 'Av. Argentina 789', 'Valparaíso', 'Chile', 2022, 'https://webmasters.com/logo.png', 0, 4.3, 4, 3, 300, '["React", "Vue.js", "Laravel", "WordPress"]', '["Capacitación", "Horario flexible"]', 'full-remote', '3 meses', '350000-550000', 'webmasters@leanmaker.com', '+56 32 2345 6789', 'active'),
(@cloudservices_id, 'Cloud Services', 'Cloud Computing', 'Grande', 'Proveedor de servicios en la nube y consultoría de infraestructura', 'https://cloudservices.net', 'Av. Apoquindo 123', 'Santiago', 'Chile', 2017, 'https://cloudservices.net/logo.png', 1, 4.6, 18, 15, 1500, '["AWS", "Azure", "GCP", "Terraform"]', '["Certificaciones", "Stock options", "Gimnasio"]', 'hybrid', '6 meses', '600000-900000', 'cloudservices@leanmaker.com', '+56 2 5678 9012', 'active'),
(@fintechglobal_id, 'FinTech Global', 'Fintech', 'Mediana', 'Empresa de tecnología financiera enfocada en pagos digitales', 'https://fintechglobal.com', 'Av. El Bosque 567', 'Santiago', 'Chile', 2020, 'https://fintechglobal.com/logo.png', 1, 4.5, 9, 7, 750, '["Java", "Spring", "PostgreSQL", "Redis"]', '["Capacitación", "Horario flexible"]', 'onsite', '5 meses', '500000-800000', 'fintechglobal@leanmaker.com', '+56 2 6789 0123', 'active'),
(@healthtech_id, 'HealthTech', 'Salud Digital', 'Pequeña', 'Startup de tecnología médica y aplicaciones de salud', 'https://healthtech.co', 'Av. Paicaví 890', 'Concepción', 'Chile', 2023, 'https://healthtech.co/logo.png', 0, 4.2, 3, 2, 200, '["Python", "Django", "React", "PostgreSQL"]', '["Capacitación", "Horario flexible"]', 'hybrid', '4 meses', '400000-600000', 'healthtech@leanmaker.com', '+56 41 3456 7890', 'active'),
(@gamestudios_id, 'Game Studios', 'Gaming', 'Mediana', 'Desarrolladora de videojuegos independientes', 'https://gamestudios.com', 'Av. Manquehue 345', 'Santiago', 'Chile', 2021, 'https://gamestudios.com/logo.png', 1, 4.4, 7, 5, 600, '["Unity", "C#", "Blender", "Photoshop"]', '["Equipo nuevo", "Horario flexible", "Gimnasio"]', 'onsite', '4 meses', '450000-700000', 'gamestudios@leanmaker.com', '+56 2 7890 1234', 'active');

-- =====================================================
-- INSERTAR ESTUDIANTES
-- =====================================================

-- Obtener IDs de usuarios para estudiantes
DECLARE @juan_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'juan.perez@leanmaker.com');
DECLARE @maria_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'maria.gomez@leanmaker.com');
DECLARE @carlos_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'carlos.lopez@leanmaker.com');
DECLARE @ana_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'ana.martinez@leanmaker.com');
DECLARE @diego_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'diego.hernandez@leanmaker.com');
DECLARE @sofia_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'sofia.garcia@leanmaker.com');
DECLARE @javier_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'javier.diaz@leanmaker.com');
DECLARE @laura_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'laura.fernandez@leanmaker.com');
DECLARE @pablo_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'pablo.moreno@leanmaker.com');
DECLARE @valentina_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'valentina.romero@leanmaker.com');

INSERT INTO students (user_id, career, semester, graduation_year, status, api_level, strikes, gpa, completed_projects, total_hours, skills, experience_years, portfolio_url, github_url, linkedin_url, availability, location, languages, rating) VALUES
(@juan_id, 'Ingeniería Civil en Informática', 8, 2025, 'approved', 3, 0, 6.2, 2, 240, '["React", "TypeScript", "Node.js", "MongoDB"]', 1, 'https://juanperez.dev', 'https://github.com/juanperez', 'https://linkedin.com/in/juanperez', 'full-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.5),
(@maria_id, 'Ingeniería Civil en Computación', 6, 2026, 'approved', 2, 1, 5.8, 1, 120, '["Python", "Django", "PostgreSQL", "Docker"]', 1, 'https://mariagomez.dev', 'https://github.com/mariagomez', NULL, 'part-time', 'Valparaíso, Chile', '["Español"]', 4.2),
(@carlos_id, 'Ingeniería en Informática', 9, 2024, 'suspended', 4, 3, 6.5, 4, 400, '["Java", "Spring", "AWS", "Kubernetes"]', 3, 'https://carloslopez.dev', 'https://github.com/carloslopez', 'https://linkedin.com/in/carloslopez', 'flexible', 'Concepción, Chile', '["Español", "Inglés"]', 4.8),
(@ana_id, 'Diseño Gráfico', 7, 2025, 'approved', 2, 0, 6.0, 1, 80, '["Figma", "Illustrator", "Photoshop", "After Effects"]', 1, 'https://anamartinez.design', NULL, NULL, 'part-time', 'Santiago, Chile', '["Español"]', 4.1),
(@diego_id, 'Periodismo', 8, 2025, 'approved', 1, 0, 5.9, 0, 40, '["Redacción", "SEO", "Wordpress", "Analytics"]', 2, NULL, NULL, NULL, 'flexible', 'Valparaíso, Chile', '["Español"]', 4.0),
(@sofia_id, 'Ingeniería Comercial', 10, 2024, 'approved', 3, 0, 6.4, 3, 300, '["Excel", "Power BI", "SQL", "Tableau"]', 2, NULL, NULL, 'https://linkedin.com/in/sofiagarcia', 'full-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.7),
(@javier_id, 'Ingeniería Civil Industrial', 8, 2025, 'approved', 2, 0, 6.1, 1, 150, '["Python", "Project", "Excel", "R"]', 1, NULL, NULL, NULL, 'part-time', 'Santiago, Chile', '["Español"]', 4.3),
(@laura_id, 'Psicología', 9, 2024, 'approved', 1, 1, 6.3, 0, 60, '["Investigación", "SPSS", "Excel", "Qualtrics"]', 1, NULL, NULL, NULL, 'flexible', 'Concepción, Chile', '["Español"]', 4.4),
(@pablo_id, 'Ingeniería Civil en Informática', 7, 2026, 'approved', 2, 0, 6.0, 1, 100, '["Vue.js", "Laravel", "MySQL", "Docker"]', 1, 'https://pablomoreno.dev', 'https://github.com/pablomoreno', NULL, 'part-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.2),
(@valentina_id, 'Ingeniería en Computación', 8, 2025, 'approved', 3, 0, 6.3, 2, 180, '["Angular", "Java", "Spring Boot", "PostgreSQL"]', 2, 'https://valentinaromero.dev', 'https://github.com/valentinaromero', 'https://linkedin.com/in/valentinaromero', 'full-time', 'Valparaíso, Chile', '["Español", "Inglés"]', 4.6);

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
PRINT '- 22 usuarios (2 admins, 10 empresas, 10 estudiantes)';
PRINT '- 4 proyectos activos';
PRINT '- 5 postulaciones (2 aceptadas, 2 pendientes, 1 rechazada)';
PRINT '- 4 asignaciones en curso';
PRINT '- 5 registros de horas trabajadas';
PRINT '- 5 evaluaciones completadas';
PRINT '- 4 notificaciones';
PRINT '';
PRINT 'Script completado exitosamente!';
GO
