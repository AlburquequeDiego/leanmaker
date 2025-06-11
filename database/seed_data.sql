-- =====================================================
-- DATOS DE EJEMPLO - LEANMAKER
-- SQL Server
-- =====================================================

USE leanmaker_db;
GO

-- =====================================================
-- INSERTAR USUARIOS
-- =====================================================
INSERT INTO users (username, email, password, first_name, last_name, user_type, is_active, is_staff) VALUES
-- Empresas
('techcorp_admin', 'admin@techcorp.com', 'hashed_password_123', 'María', 'González', 'company', 1, 0),
('innovate_ceo', 'ceo@innovate.com', 'hashed_password_456', 'Carlos', 'Rodríguez', 'company', 1, 0),
('startup_founder', 'founder@startup.com', 'hashed_password_789', 'Ana', 'Silva', 'company', 1, 0),

-- Estudiantes
('juan_dev', 'juan.perez@email.com', 'hashed_password_101', 'Juan', 'Pérez', 'student', 1, 0),
('maria_student', 'maria.gonzalez@email.com', 'hashed_password_102', 'María', 'González', 'student', 1, 0),
('carlos_coder', 'carlos.rodriguez@email.com', 'hashed_password_103', 'Carlos', 'Rodríguez', 'student', 1, 0),
('laura_tech', 'laura.martinez@email.com', 'hashed_password_104', 'Laura', 'Martínez', 'student', 1, 0),
('diego_engineer', 'diego.lopez@email.com', 'hashed_password_105', 'Diego', 'López', 'student', 1, 0),

-- Admin
('admin', 'admin@leanmaker.com', 'hashed_password_admin', 'Admin', 'System', 'admin', 1, 1);

-- =====================================================
-- INSERTAR EMPRESAS
-- =====================================================
INSERT INTO companies (user_id, company_name, description, industry, size, website, city, country, founded_year, verified, rating, total_projects) VALUES
(1, 'TechCorp Solutions', 'Empresa líder en desarrollo de software empresarial con más de 10 años de experiencia', 'Tecnología', 'Mediana', 'https://techcorp.com', 'Santiago', 'Chile', 2013, 1, 4.5, 15),
(2, 'Innovate Labs', 'Startup innovadora enfocada en soluciones de inteligencia artificial y machine learning', 'Tecnología', 'Pequeña', 'https://innovatelabs.com', 'Valparaíso', 'Chile', 2020, 1, 4.2, 8),
(3, 'StartupHub', 'Plataforma que conecta startups con talento joven para proyectos innovadores', 'E-commerce', 'Pequeña', 'https://startuphub.com', 'Concepción', 'Chile', 2022, 0, 3.8, 5);

-- =====================================================
-- INSERTAR ESTUDIANTES
-- =====================================================
INSERT INTO students (user_id, university, career, semester, graduation_year, gpa, skills, experience_years, portfolio_url, github_url, linkedin_url, availability, location, languages, rating, projects_completed) VALUES
(4, 'Universidad de Chile', 'Ingeniería Civil en Informática', 8, 2024, 6.2, '["React", "TypeScript", "Node.js", "MongoDB", "Git"]', 2, 'https://juanperez.dev', 'https://github.com/juanperez', 'https://linkedin.com/in/juanperez', 'full-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.5, 3),
(5, 'Pontificia Universidad Católica', 'Ingeniería Civil en Computación', 7, 2025, 6.5, '["Python", "Django", "PostgreSQL", "Docker", "AWS"]', 1, 'https://mariagonzalez.dev', 'https://github.com/mariagonzalez', 'https://linkedin.com/in/mariagonzalez', 'part-time', 'Valparaíso, Chile', '["Español", "Inglés", "Portugués"]', 4.2, 2),
(6, 'Universidad Técnica Federico Santa María', 'Ingeniería Civil Informática', 9, 2024, 6.8, '["Java", "Spring Boot", "MySQL", "React Native", "Firebase"]', 3, 'https://carlosrodriguez.dev', 'https://github.com/carlosrodriguez', 'https://linkedin.com/in/carlosrodriguez', 'flexible', 'Concepción, Chile', '["Español", "Inglés"]', 4.8, 5),
(7, 'Universidad de Santiago', 'Ingeniería en Informática', 6, 2026, 6.0, '["Vue.js", "Laravel", "MySQL", "Bootstrap", "PHP"]', 1, 'https://lauramartinez.dev', 'https://github.com/lauramartinez', 'https://linkedin.com/in/lauramartinez', 'part-time', 'Santiago, Chile', '["Español", "Inglés"]', 3.9, 1),
(8, 'Universidad de Concepción', 'Ingeniería Civil en Informática', 8, 2024, 6.3, '["Angular", "C#", ".NET", "SQL Server", "Azure"]', 2, 'https://diegolopez.dev', 'https://github.com/diegolopez', 'https://linkedin.com/in/diegolopez', 'full-time', 'Concepción, Chile', '["Español", "Inglés"]', 4.1, 2);

-- =====================================================
-- INSERTAR PROYECTOS
-- =====================================================
INSERT INTO projects (company_id, title, description, requirements, skills_required, duration, difficulty, api_level, max_students, current_students, applications_count, status, deadline, start_date, end_date, budget) VALUES
(1, 'Desarrollo Web Frontend', 'Crear una aplicación web moderna con React y TypeScript para gestión de inventarios', '["Portfolio requerido", "GitHub activo"]', '["React", "TypeScript", "Material-UI", "Git"]', '3 meses', 'intermediate', 3, 2, 2, 8, 'active', '2024-05-01', '2024-02-01', '2024-05-01', 1500000),
(1, 'API REST con Django', 'Desarrollar una API REST completa para sistema de gestión de usuarios', '["Experiencia previa", "Entrevista obligatoria"]', '["Python", "Django", "PostgreSQL", "REST API"]', '4 meses', 'advanced', 4, 1, 1, 5, 'active', '2024-07-01', '2024-03-01', '2024-07-01', 2000000),
(2, 'App Móvil React Native', 'Aplicación móvil para gestión de tareas y proyectos', '["Portfolio requerido"]', '["React Native", "JavaScript", "Firebase"]', '2 meses', 'beginner', 2, 3, 1, 12, 'published', '2024-06-01', '2024-04-01', '2024-06-01', 1200000),
(2, 'Sistema de Machine Learning', 'Implementar algoritmos de ML para análisis de datos de ventas', '["Certificaciones", "Experiencia previa"]', '["Python", "TensorFlow", "Pandas", "Scikit-learn"]', '5 meses', 'advanced', 5, 1, 0, 3, 'published', '2024-08-01', '2024-03-01', '2024-08-01', 2500000),
(3, 'E-commerce Platform', 'Plataforma de comercio electrónico completa', '["GitHub activo", "Entrevista obligatoria"]', '["Vue.js", "Laravel", "MySQL", "Bootstrap"]', '6 meses', 'intermediate', 3, 2, 0, 6, 'draft', '2024-09-01', '2024-03-01', '2024-09-01', 3000000);

-- =====================================================
-- INSERTAR POSTULACIONES
-- =====================================================
INSERT INTO applications (project_id, student_id, status, cover_letter, applied_at) VALUES
(1, 1, 'accepted', 'Me interesa mucho este proyecto. Tengo experiencia en React y TypeScript...', '2024-01-15'),
(1, 2, 'accepted', 'Soy estudiante de la PUC y tengo experiencia en desarrollo web...', '2024-01-16'),
(2, 3, 'accepted', 'Tengo 3 años de experiencia en Python y Django...', '2024-01-10'),
(3, 1, 'pending', 'Me gustaría participar en este proyecto móvil...', '2024-01-20'),
(3, 4, 'pending', 'Tengo experiencia en React Native...', '2024-01-21'),
(3, 5, 'pending', 'Soy estudiante de la USACH y me interesa el desarrollo móvil...', '2024-01-22'),
(4, 3, 'accepted', 'Tengo experiencia en machine learning y análisis de datos...', '2024-01-05'),
(5, 4, 'pending', 'Me interesa mucho el desarrollo de e-commerce...', '2024-01-25');

-- =====================================================
-- INSERTAR EVALUACIONES
-- =====================================================
INSERT INTO evaluations (project_id, student_id, evaluator_id, type, status, technical_skills, communication, teamwork, problem_solving, overall_rating, comments, strengths, areas_for_improvement, due_date, completed_date) VALUES
(1, 1, 1, 'midterm', 'completed', 4, 3, 4, 4, 3.8, 'Excelente progreso en el desarrollo frontend. Muestra buena comprensión de React y TypeScript.', '["React", "TypeScript", "Git"]', '["Documentación", "Testing"]', '2024-01-15', '2024-01-14'),
(1, 2, 1, 'midterm', 'completed', 5, 4, 5, 4, 4.5, 'Desarrollo excepcional del backend. API bien estructurada y documentada.', '["Django", "PostgreSQL", "REST API", "Documentación"]', '["Performance optimization"]', '2024-01-25', '2024-01-24'),
(2, 3, 1, 'weekly', 'overdue', 3, 2, 3, 3, 2.8, 'Necesita mejorar la comunicación y cumplir con los deadlines establecidos.', '["React Native", "JavaScript"]', '["Comunicación", "Puntualidad", "Testing"]', '2024-01-10', NULL);

-- =====================================================
-- INSERTAR ENTREVISTAS
-- =====================================================
INSERT INTO interviews (project_id, student_id, interviewer_id, type, status, scheduled_date, duration, location, notes, outcome, feedback, next_steps) VALUES
(1, 1, 1, 'technical', 'completed', '2024-01-15T14:00:00', 60, 'Sala de Reuniones A', 'Entrevista técnica enfocada en React y TypeScript', 'passed', 'Excelente conocimiento técnico. Buenas habilidades de resolución de problemas.', 'Contratación inmediata para el proyecto'),
(1, 2, 1, 'final', 'scheduled', '2024-01-20T10:00:00', 90, 'Zoom Meeting', 'Entrevista final para evaluación completa', 'pending', '', ''),
(3, 3, 2, 'behavioral', 'cancelled', '2024-01-18T16:00:00', 45, 'Oficina Principal', 'Entrevista cancelada por el estudiante', 'failed', 'No se presentó a la entrevista', 'No proceder con la candidatura');

-- =====================================================
-- INSERTAR STRIKES
-- =====================================================
INSERT INTO strikes (project_id, student_id, reported_by, type, severity, description, evidence, status, resolution, resolved_date) VALUES
(1, 1, 1, 'attendance', 'medium', 'Falta injustificada a reunión de seguimiento del proyecto', 'Registro de asistencia y comunicación con el estudiante', 'active', NULL, NULL),
(2, 3, 1, 'deadline', 'high', 'Entrega tardía de milestone crítico sin justificación previa', 'Documentación de fechas de entrega y comunicación', 'resolved', 'El estudiante presentó justificación médica válida', '2024-01-12'),
(3, 2, 2, 'quality', 'low', 'Código entregado no cumple con estándares de calidad establecidos', 'Revisión de código y documentación de estándares', 'active', NULL, NULL);

-- =====================================================
-- INSERTAR NOTIFICACIONES
-- =====================================================
INSERT INTO notifications (user_id, title, message, type, is_read, related_url) VALUES
(1, 'Nueva Postulación', 'Juan Pérez se ha postulado a tu proyecto "Desarrollo Web Frontend"', 'info', 0, '/projects/1/applications'),
(1, 'Evaluación Pendiente', 'Tienes una evaluación pendiente para el proyecto "API REST con Django"', 'warning', 0, '/evaluations/2'),
(4, 'Entrevista Programada', 'Tu entrevista para el proyecto "Desarrollo Web Frontend" está programada para el 15 de enero', 'success', 1, '/interviews/1'),
(5, 'Proyecto Aceptado', '¡Felicitaciones! Has sido aceptado en el proyecto "App Móvil React Native"', 'success', 0, '/projects/3'),
(2, 'Strike Reportado', 'Se ha reportado un strike en el proyecto "API REST con Django"', 'error', 0, '/strikes/2');

-- =====================================================
-- INSERTAR CALIFICACIONES
-- =====================================================
INSERT INTO ratings (rater_id, rated_id, project_id, rating, comment) VALUES
(1, 4, 1, 4.5, 'Excelente trabajo en el proyecto. Muy profesional y responsable.'),
(4, 1, 1, 4.8, 'Empresa muy profesional, excelente comunicación y apoyo.'),
(1, 5, 1, 4.2, 'Buen trabajo, necesita mejorar en documentación.'),
(5, 1, 1, 4.0, 'Buena empresa, pero los deadlines son muy ajustados.'),
(2, 6, 2, 4.7, 'Estudiante excepcional, muy recomendado.'),
(6, 2, 2, 4.5, 'Excelente experiencia trabajando con esta empresa.');

GO

-- =====================================================
-- ACTUALIZAR ESTADÍSTICAS
-- =====================================================
EXEC sp_UpdateProjectStats 1;
EXEC sp_UpdateProjectStats 2;
EXEC sp_UpdateProjectStats 3;
EXEC sp_UpdateProjectStats 4;
EXEC sp_UpdateProjectStats 5;

GO

PRINT 'Datos de ejemplo insertados correctamente!';
PRINT 'Total de usuarios: ' + CAST((SELECT COUNT(*) FROM users) AS NVARCHAR(10));
PRINT 'Total de empresas: ' + CAST((SELECT COUNT(*) FROM companies) AS NVARCHAR(10));
PRINT 'Total de estudiantes: ' + CAST((SELECT COUNT(*) FROM students) AS NVARCHAR(10));
PRINT 'Total de proyectos: ' + CAST((SELECT COUNT(*) FROM projects) AS NVARCHAR(10));
PRINT 'Total de postulaciones: ' + CAST((SELECT COUNT(*) FROM applications) AS NVARCHAR(10)); 