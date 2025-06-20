-- =====================================================
-- DATOS DE EJEMPLO AMPLIADOS (VERSIÓN CORREGIDA Y EXPLÍCITA) - LEANMAKER
-- SQL Server
-- =====================================================

USE leanmaker_db;
GO

-- Limpiar tablas en orden inverso de dependencias para poder re-ejecutar el script
DELETE FROM calendar_events;
DELETE FROM notifications;
DELETE FROM strikes;
DELETE FROM ratings;
DELETE FROM evaluation_categories;
DELETE FROM evaluations;
DELETE FROM work_hours;
DELETE FROM assignments;
DELETE FROM applications;
DELETE FROM projects;
DELETE FROM students;
DELETE FROM companies;
DELETE FROM admins;
DELETE FROM users;
DELETE FROM project_status;
DELETE FROM areas;
DELETE FROM trl_levels;
GO

-- Reiniciar el contador de identidad para cada tabla
DBCC CHECKIDENT ('calendar_events', RESEED, 0);
DBCC CHECKIDENT ('notifications', RESEED, 0);
DBCC CHECKIDENT ('strikes', RESEED, 0);
DBCC CHECKIDENT ('ratings', RESEED, 0);
DBCC CHECKIDENT ('evaluation_categories', RESEED, 0);
DBCC CHECKIDENT ('evaluations', RESEED, 0);
DBCC CHECKIDENT ('work_hours', RESEED, 0);
DBCC CHECKIDENT ('assignments', RESEED, 0);
DBCC CHECKIDENT ('applications', RESEED, 0);
DBCC CHECKIDENT ('projects', RESEED, 0);
DBCC CHECKIDENT ('students', RESEED, 0);
DBCC CHECKIDENT ('companies', RESEED, 0);
DBCC CHECKIDENT ('admins', RESEED, 0);
DBCC CHECKIDENT ('users', RESEED, 0);
DBCC CHECKIDENT ('project_status', RESEED, 0);
DBCC CHECKIDENT ('areas', RESEED, 0);
DBCC CHECKIDENT ('trl_levels', RESEED, 0);
GO


-- =====================================================
-- DATOS DE CONFIGURACIÓN
-- =====================================================
INSERT INTO trl_levels (level, name, description) VALUES
(1, 'Idea', 'Concepto básico y principios observados.'),(2, 'Concepto tecnológico', 'Formulación del concepto y/o aplicación tecnológica.'),(3, 'Prueba de concepto', 'Prueba de concepto analítica y experimental.'),(4, 'Validación en laboratorio', 'Componente y/o maqueta validada en entorno de laboratorio.'),(5, 'Validación en entorno relevante', 'Componente y/o maqueta validada en un entorno relevante.'),(6, 'Demostración en entorno relevante', 'Prototipo del sistema/modelo demostrado en un entorno relevante.'),(7, 'Demostración en entorno operativo', 'Prototipo del sistema demostrado en un entorno operativo.'),(8, 'Sistema completo y calificado', 'Sistema completo y calificado a través de pruebas y demostraciones.'),(9, 'Sistema probado en entorno operativo', 'Sistema real probado en un entorno operativo.');
INSERT INTO areas (name, description) VALUES
('Desarrollo Web', 'Creación de sitios y aplicaciones web.'),('Desarrollo Móvil', 'Creación de aplicaciones para dispositivos móviles.'),('Ciencia de Datos', 'Análisis, visualización e interpretación de datos.'),('Inteligencia Artificial', 'Sistemas que aprenden y toman decisiones.'),('Ciberseguridad', 'Protección de sistemas y datos.'),('Infraestructura y DevOps', 'Automatización, despliegue y mantenimiento de sistemas.');
INSERT INTO project_status (name, description, color) VALUES
('Borrador', 'El proyecto está en fase de planificación y no es visible para los estudiantes.', '#6c757d'),('Abierto', 'El proyecto está publicado y acepta postulaciones.', '#28a745'),('En Progreso', 'El proyecto tiene estudiantes asignados y está en desarrollo.', '#007bff'),('En Pausa', 'El proyecto está temporalmente detenido.', '#ffc107'),('Completado', 'El proyecto ha finalizado exitosamente.', '#17a2b8'),('Cancelado', 'El proyecto ha sido cancelado antes de su finalización.', '#dc3545');

-- =====================================================
-- INSERTAR USUARIOS (2 Admins, 15 Empresas, 15 Estudiantes)
-- =====================================================
SET IDENTITY_INSERT users ON;
INSERT INTO users (id, email, password, role, name, is_active, is_staff) VALUES
-- Admins (2)
(1, 'admin@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'admin', 'Admin Principal', 1, 1),
(2, 'supervisor@leanmaker.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'admin', 'Supervisor General', 1, 1),
-- Empresas (15)
(3, 'contacto@techsolutions.cl', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Ana Contreras', 1, 0),
(4, 'rrhh@innovatech.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Luis Valdés', 1, 0),
(5, 'manager@datasciencecorp.io', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Elena Ríos', 1, 0),
(6, 'admin@cybersecure.cl', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Pedro Pascal', 1, 0),
(7, 'info@mobilefirst.dev', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Sofia Vergara', 1, 0),
(8, 'hola@webmasters.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Arturo Vidal', 1, 0),
(9, 'jobs@cloudservices.net', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Gabriela Mistral', 1, 0),
(10, 'support@fintechglobal.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Pablo Neruda', 1, 0),
(11, 'contact@healthtech.co', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Isabel Allende', 1, 0),
(12, 'hiring@gamestudios.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Marcelo Salas', 1, 0),
(13, 'proyectos@edutech.org', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Alexis Sánchez', 1, 0),
(14, 'vacantes@retaildynamics.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Claudio Bravo', 1, 0),
(15, 'info@greentech.eco', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Gary Medel', 1, 0),
(16, 'partner@travelnow.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Charles Aránguiz', 1, 0),
(17, 'jobs@logistics.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'company', 'Eduardo Vargas', 1, 0),
-- Estudiantes (15)
(18, 'juan.perez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Juan Pérez', 1, 0),
(19, 'maria.gomez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'María Gómez', 1, 0),
(20, 'carlos.lopez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Carlos López', 1, 0),
(21, 'ana.martinez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Ana Martínez', 1, 0),
(22, 'diego.hernandez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Diego Hernández', 1, 0),
(23, 'sofia.garcia@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Sofía García', 1, 0),
(24, 'javier.diaz@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Javier Díaz', 1, 0),
(25, 'laura.fernandez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Laura Fernández', 1, 0),
(26, 'pablo.moreno@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Pablo Moreno', 1, 0),
(27, 'valentina.romero@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Valentina Romero', 1, 0),
(28, 'matias.alvarez@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Matías Álvarez', 1, 0),
(29, 'camila.torres@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Camila Torres', 1, 0),
(30, 'nicolas.ruiz@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Nicolás Ruiz', 1, 0),
(31, 'isidora.vargas@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Isidora Vargas', 1, 0),
(32, 'benjamin.castro@email.com', 'pbkdf2_sha256$260000$test$n+ZN7gG0w2d3aI/O8YIsC5p32E4O5O5B2b5m8A6gC9E=', 'student', 'Benjamín Castro', 1, 0);
SET IDENTITY_INSERT users OFF;

-- =====================================================
-- INSERTAR PERFILES ESPECÍFICOS
-- =====================================================
SET IDENTITY_INSERT admins ON;
INSERT INTO admins (id, user_id, permissions) VALUES (1, 1, '["full_access"]'), (2, 2, '["review_access"]');
SET IDENTITY_INSERT admins OFF;

SET IDENTITY_INSERT companies ON;
INSERT INTO companies (id, user_id, company_name, description, industry, size, website, address, city, country, founded_year, logo_url, verified, rating, total_projects) VALUES
(1, 3, 'Tech Solutions', 'Líder en desarrollo de software a medida.', 'Tecnología', 'Mediana', 'https://techsolutions.cl', 'Av. Providencia 123', 'Santiago', 'Chile', 2015, NULL, 1, 4.5, 2),
(2, 4, 'InnovaTech', 'Startup de IA y Machine Learning.', 'Tecnología', 'Pequeña', 'https://innovatech.com', NULL, 'Valparaíso', 'Chile', 2021, NULL, 1, 4.8, 1),
(3, 5, 'Data Science Corp', 'Consultoría en Big Data.', 'Ciencia de Datos', 'Grande', 'https://datasciencecorp.io', 'O''Higgins 456', 'Concepción', 'Chile', 2018, NULL, 1, 4.2, 1),
(4, 6, 'CyberSecure', 'Expertos en ciberseguridad.', 'Ciberseguridad', 'Mediana', 'https://cybersecure.cl', NULL, 'Santiago', 'Chile', 2019, NULL, 0, 3.9, 0),
(5, 7, 'Mobile First', 'Desarrollo de apps móviles nativas.', 'Desarrollo Móvil', 'Pequeña', 'https://mobilefirst.dev', NULL, 'Valparaíso', 'Chile', 2022, NULL, 1, 4.1, 1),
(6, 8, 'WebMasters', 'Agencia de desarrollo web y SEO.', 'Desarrollo Web', 'Pequeña', 'https://webmasters.com', NULL, 'Santiago', 'Chile', 2020, NULL, 0, 3.5, 0),
(7, 9, 'Cloud Services', 'Soluciones de infraestructura en la nube.', 'Infraestructura y DevOps', 'Grande', 'https://cloudservices.net', NULL, 'Santiago', 'Chile', 2017, NULL, 1, 4.6, 0),
(8, 10, 'Fintech Global', 'Innovación en finanzas.', 'Fintech', 'Mediana', 'https://fintechglobal.com', 'Apoquindo 5000', 'Santiago', 'Chile', 2019, NULL, 1, 4.3, 0),
(9, 11, 'HealthTech', 'Tecnología para el sector salud.', 'Salud', 'Grande', 'https://healthtech.co', NULL, 'Valparaíso', 'Chile', 2016, NULL, 1, 4.7, 0),
(10, 12, 'Game Studios', 'Desarrollo de videojuegos.', 'Entretenimiento', 'Mediana', 'https://gamestudios.com', NULL, 'Santiago', 'Chile', 2018, NULL, 0, 4.0, 0),
(11, 13, 'EduTech', 'Plataformas de e-learning.', 'Educación', 'Pequeña', 'https://edutech.org', NULL, 'Concepción', 'Chile', 2021, NULL, 1, 4.4, 0),
(12, 14, 'Retail Dynamics', 'Soluciones para el sector retail.', 'Retail', 'Grande', 'https://retaildynamics.com', NULL, 'Santiago', 'Chile', 2014, NULL, 1, 4.2, 0),
(13, 15, 'GreenTech', 'Tecnología para la sostenibilidad.', 'Sostenibilidad', 'Pequeña', 'https://greentech.eco', NULL, 'Valdivia', 'Chile', 2022, NULL, 0, 3.8, 0),
(14, 16, 'TravelNow', 'Plataforma de reservas de viajes.', 'Turismo', 'Mediana', 'https://travelnow.com', NULL, 'Viña del Mar', 'Chile', 2019, NULL, 1, 4.1, 0),
(15, 17, 'Logistics Corp', 'Optimización de cadenas de suministro.', 'Logística', 'Grande', 'https://logistics.com', NULL, 'Antofagasta', 'Chile', 2015, NULL, 1, 4.0, 0);
SET IDENTITY_INSERT companies OFF;

SET IDENTITY_INSERT students ON;
INSERT INTO students (id, user_id, career, semester, graduation_year, status, api_level, strikes, gpa, completed_projects, total_hours, skills, experience_years, portfolio_url, github_url, linkedin_url, availability, location, languages, rating) VALUES
(1, 18, 'Ingeniería Civil en Informática', 8, 2025, 'approved', 3, 0, 6.2, 2, 240, '["React", "TypeScript", "Node.js"]', 1, 'http://portfolio.com/jp', 'http://github.com/jp', NULL, 'full-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.5),
(2, 19, 'Ingeniería Civil en Computación', 6, 2026, 'approved', 2, 1, 5.8, 1, 120, '["Python", "Django", "PostgreSQL"]', 1, 'http://portfolio.com/mg', NULL, NULL, 'part-time', 'Valparaíso, Chile', '["Español"]', 4.2),
(3, 20, 'Ingeniería en Informática', 9, 2024, 'suspended', 4, 3, 6.5, 4, 400, '["Java", "Spring", "AWS"]', 3, 'http://portfolio.com/cl', NULL, NULL, 'flexible', 'Concepción, Chile', '["Español", "Inglés"]', 4.8),
(4, 21, 'Diseño Gráfico', 7, 2025, 'approved', 2, 0, 6.0, 1, 80, '["Figma", "Illustrator", "Photoshop"]', 1, NULL, NULL, NULL, 'part-time', 'Santiago, Chile', '["Español"]', 4.1),
(5, 22, 'Periodismo', 8, 2025, 'approved', 1, 0, 5.9, 0, 40, '["Redacción", "SEO", "Wordpress"]', 2, NULL, NULL, NULL, 'flexible', 'Valparaíso, Chile', '["Español"]', 4.0),
(6, 23, 'Ingeniería Comercial', 10, 2024, 'approved', 3, 0, 6.4, 3, 300, '["Excel", "Power BI", "SQL"]', 2, NULL, NULL, NULL, 'full-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.7),
(7, 24, 'Ingeniería Civil Industrial', 8, 2025, 'approved', 2, 0, 6.1, 1, 150, '["Python", "Project", "Excel"]', 1, NULL, NULL, NULL, 'part-time', 'Santiago, Chile', '["Español"]', 4.3),
(8, 25, 'Psicología', 9, 2024, 'approved', 1, 1, 6.3, 0, 60, '["Investigación", "SPSS", "Excel"]', 1, NULL, NULL, NULL, 'flexible', 'Concepción, Chile', '["Español"]', 4.4),
(9, 26, 'Publicidad', 7, 2025, 'approved', 2, 0, 5.7, 1, 100, '["Google Ads", "Facebook Ads", "SEO"]', 0, NULL, NULL, NULL, 'part-time', 'Valparaíso, Chile', '["Español"]', 3.9),
(10, 27, 'Arquitectura', 10, 2024, 'approved', 2, 0, 6.6, 2, 250, '["AutoCAD", "Revit", "SketchUp"]', 2, NULL, NULL, NULL, 'full-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.9),
(11, 28, 'Derecho', 5, 2027, 'pending', 1, 0, 6.8, 0, 0, '[]', 0, NULL, NULL, NULL, 'flexible', 'Santiago, Chile', '["Español"]', 0),
(12, 29, 'Medicina', 3, 2029, 'pending', 1, 0, 6.9, 0, 0, '[]', 0, NULL, NULL, NULL, 'flexible', 'Concepción, Chile', '["Español"]', 0),
(13, 30, 'Traducción Inglés-Español', 8, 2025, 'approved', 2, 0, 6.2, 5, 500, '["Trados", "MemoQ", "Interpretación"]', 3, NULL, NULL, NULL, 'full-time', 'Valparaíso, Chile', '["Español", "Inglés"]', 4.6),
(14, 31, 'Kinesiología', 9, 2024, 'approved', 1, 2, 6.0, 1, 180, '["Terapia Manual", "Rehabilitación"]', 2, NULL, NULL, NULL, 'part-time', 'Santiago, Chile', '["Español"]', 4.0),
(15, 32, 'Nutrición y Dietética', 7, 2025, 'approved', 1, 0, 6.1, 0, 90, '["Evaluación Nutricional", "Dietoterapia"]', 1, NULL, NULL, NULL, 'flexible', 'Concepción, Chile', '["Español"]', 4.2);
SET IDENTITY_INSERT students OFF;

-- =====================================================
-- INSERTAR ALGUNOS PROYECTOS Y POSTULACIONES PARA DAR VIDA A LOS DATOS
-- =====================================================
SET IDENTITY_INSERT projects ON;
INSERT INTO projects (id, company_id, status_id, area_id, title, description, trl_id, api_level, required_hours, start_date) VALUES
(1, 1, 2, 1, 'Web de E-commerce', 'Desarrollo de una plataforma de e-commerce con React.', 5, 3, 200, '2024-08-01'),
(2, 2, 3, 4, 'Motor de Recomendaciones', 'Crear un motor de recomendaciones con Python.', 7, 4, 300, '2024-07-15'),
(3, 3, 2, 3, 'Dashboard de Ventas', 'Visualización de datos de ventas con Power BI.', 6, 3, 150, '2024-09-01'),
(4, 5, 2, 2, 'App de Telemedicina', 'App móvil para consultas médicas remotas.', 8, 4, 250, '2024-08-15');
SET IDENTITY_INSERT projects OFF;

SET IDENTITY_INSERT applications ON;
INSERT INTO applications (id, project_id, student_id, status) VALUES 
(1, 1, 1, 'accepted'), -- Juan a Tech Solutions
(2, 2, 2, 'accepted'), -- María a InnovaTech
(3, 3, 6, 'pending'),  -- Sofia a Data Science Corp
(4, 4, 4, 'pending'),  -- Ana a Mobile First
(5, 1, 7, 'rejected'); -- Javier a Tech Solutions
SET IDENTITY_INSERT applications OFF;

SET IDENTITY_INSERT assignments ON;
INSERT INTO assignments (id, application_id, fecha_inicio, estado) VALUES 
(1, 1, '2024-08-01', 'en curso'),
(2, 2, '2024-07-15', 'en curso');
SET IDENTITY_INSERT assignments OFF;



-- ESTE CODIGO FUE DE DIEGO ALBURQUERQUE
GO
PRINT 'Datos de ejemplo AMPLIADOS (v2) insertados exitosamente! - Diego Alburquerque'
GO
