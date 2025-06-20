-- =====================================================
-- DATOS DE EJEMPLO PULIDOS - LEANMAKER
-- SQL Server
-- Datos realistas y completos para testing
-- =====================================================

USE leanmaker_db;
GO

-- =====================================================
-- INSERTAR USUARIOS
-- =====================================================
INSERT INTO users (email, password, role, name, is_active, is_staff) VALUES
-- Empresas
('admin@techcorp.com', 'hashed_password_123', 'company', 'María González', 1, 0),
('ceo@innovate.com', 'hashed_password_456', 'company', 'Carlos Rodríguez', 1, 0),
('founder@startup.com', 'hashed_password_789', 'company', 'Ana Silva', 1, 0),
('admin@digitaldynamics.com', 'hashed_password_101', 'company', 'Luis Martínez', 1, 0),
('admin@datacorp.com', 'hashed_password_102', 'company', 'Patricia López', 1, 0),
('admin@edutech.com', 'hashed_password_103', 'company', 'Roberto Fernández', 1, 0),
('admin@productivity.com', 'hashed_password_104', 'company', 'Carmen Ruiz', 1, 0),

-- Estudiantes
('juan.perez@email.com', 'hashed_password_105', 'student', 'Juan Pérez', 1, 0),
('maria.gonzalez@email.com', 'hashed_password_106', 'student', 'María González', 1, 0),
('carlos.rodriguez@email.com', 'hashed_password_107', 'student', 'Carlos Rodríguez', 1, 0),
('laura.martinez@email.com', 'hashed_password_108', 'student', 'Laura Martínez', 1, 0),
('diego.lopez@email.com', 'hashed_password_109', 'student', 'Diego López', 1, 0),
('sofia.garcia@email.com', 'hashed_password_110', 'student', 'Sofía García', 1, 0),
('alejandro.ruiz@email.com', 'hashed_password_111', 'student', 'Alejandro Ruiz', 1, 0),
('ana.torres@email.com', 'hashed_password_112', 'student', 'Ana Torres', 1, 0),
('luis.fernandez@email.com', 'hashed_password_113', 'student', 'Luis Fernández', 1, 0),
('pedro.lopez@email.com', 'hashed_password_114', 'student', 'Pedro López', 1, 0),
('marta.ruiz@email.com', 'hashed_password_115', 'student', 'Marta Ruiz', 1, 0),

-- Admin
('admin@leanmaker.com', 'hashed_password_admin', 'admin', 'Admin System', 1, 1);

-- =====================================================
-- INSERTAR EMPRESAS
-- =====================================================
INSERT INTO companies (user_id, company_name, description, industry, size, website, city, country, founded_year, verified, rating, total_projects) VALUES
(1, 'TechCorp Solutions', 'Empresa líder en desarrollo de software empresarial con más de 10 años de experiencia en soluciones tecnológicas innovadoras', 'Tecnología', 'Mediana', 'https://techcorp.com', 'Santiago', 'Chile', 2013, 1, 4.5, 15),
(2, 'Innovate Labs', 'Startup innovadora enfocada en soluciones de inteligencia artificial y machine learning para empresas emergentes', 'Tecnología', 'Pequeña', 'https://innovatelabs.com', 'Valparaíso', 'Chile', 2020, 1, 4.2, 8),
(3, 'StartupHub', 'Plataforma que conecta startups con talento joven para proyectos innovadores y disruptivos', 'E-commerce', 'Pequeña', 'https://startuphub.com', 'Concepción', 'Chile', 2022, 0, 3.8, 5),
(4, 'Digital Dynamics', 'Empresa especializada en desarrollo web y aplicaciones móviles con enfoque en UX/UI', 'Tecnología', 'Mediana', 'https://digitaldynamics.com', 'Santiago', 'Chile', 2018, 1, 4.0, 12),
(5, 'DataCorp', 'Empresa líder en análisis de datos y business intelligence para toma de decisiones empresariales', 'Tecnología', 'Grande', 'https://datacorp.com', 'Valparaíso', 'Chile', 2015, 1, 4.7, 20),
(6, 'EduTech Solutions', 'Plataforma educativa innovadora que revoluciona la forma de aprender con tecnología avanzada', 'Educación', 'Mediana', 'https://edutech.com', 'Santiago', 'Chile', 2019, 1, 4.3, 10),
(7, 'Productivity Inc', 'Soluciones de productividad empresarial que optimizan procesos y aumentan la eficiencia', 'Consultoría', 'Pequeña', 'https://productivity.com', 'Concepción', 'Chile', 2021, 0, 3.9, 6);

-- =====================================================
-- INSERTAR ESTUDIANTES
-- =====================================================
INSERT INTO students (user_id, career, semester, graduation_year, status, api_level, strikes, gpa, completed_projects, total_hours, skills, experience_years, portfolio_url, github_url, linkedin_url, availability, location, languages, rating) VALUES
(8, 'Ingeniería Civil en Informática', 8, 2024, 'approved', 3, 0, 6.2, 3, 156, '["React", "TypeScript", "Node.js", "MongoDB", "Git", "Docker"]', 2, 'https://juanperez.dev', 'https://github.com/juanperez', 'https://linkedin.com/in/juanperez', 'full-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.5),
(9, 'Ingeniería Civil en Computación', 7, 2025, 'approved', 2, 1, 6.5, 2, 120, '["Python", "Django", "PostgreSQL", "Docker", "AWS", "Redis"]', 1, 'https://mariagonzalez.dev', 'https://github.com/mariagonzalez', 'https://linkedin.com/in/mariagonzalez', 'part-time', 'Valparaíso, Chile', '["Español", "Inglés", "Portugués"]', 4.2),
(10, 'Ingeniería Civil Informática', 9, 2024, 'approved', 4, 0, 6.8, 5, 200, '["Java", "Spring Boot", "MySQL", "React Native", "Firebase", "Kubernetes"]', 3, 'https://carlosrodriguez.dev', 'https://github.com/carlosrodriguez', 'https://linkedin.com/in/carlosrodriguez', 'flexible', 'Concepción, Chile', '["Español", "Inglés"]', 4.8),
(11, 'Ingeniería en Informática', 6, 2026, 'approved', 2, 2, 6.0, 1, 80, '["Vue.js", "Laravel", "MySQL", "Bootstrap", "PHP", "WordPress"]', 1, 'https://lauramartinez.dev', 'https://github.com/lauramartinez', 'https://linkedin.com/in/lauramartinez', 'part-time', 'Santiago, Chile', '["Español", "Inglés"]', 3.9),
(12, 'Ingeniería Civil en Informática', 8, 2024, 'suspended', 3, 3, 6.3, 2, 140, '["Angular", "C#", ".NET", "SQL Server", "Azure", "DevOps"]', 2, 'https://diegolopez.dev', 'https://github.com/diegolopez', 'https://linkedin.com/in/diegolopez', 'full-time', 'Concepción, Chile', '["Español", "Inglés"]', 4.1),
(13, 'Ingeniería Civil en Computación', 7, 2025, 'pending', 1, 0, 5.8, 0, 0, '["JavaScript", "HTML", "CSS", "React", "Node.js"]', 0, 'https://sofiagarcia.dev', 'https://github.com/sofiagarcia', 'https://linkedin.com/in/sofiagarcia', 'flexible', 'Santiago, Chile', '["Español", "Inglés"]', 0),
(14, 'Ingeniería en Informática', 6, 2026, 'approved', 2, 1, 6.1, 1, 60, '["Python", "Flask", "SQLite", "HTML", "CSS", "JavaScript"]', 1, 'https://alejandroruiz.dev', 'https://github.com/alejandroruiz', 'https://linkedin.com/in/alejandroruiz', 'part-time', 'Valparaíso, Chile', '["Español", "Inglés"]', 4.0),
(15, 'Ingeniería Civil en Computación', 8, 2024, 'approved', 3, 0, 6.4, 2, 100, '["Python", "Pandas", "Scikit-learn", "Matplotlib", "Power BI", "SQL"]', 2, 'https://anatorres.dev', 'https://github.com/anatorres', 'https://linkedin.com/in/anatorres', 'full-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.6),
(16, 'Ingeniería en Informática', 7, 2025, 'approved', 2, 0, 6.2, 1, 80, '["Vue.js", "Laravel", "PostgreSQL", "Docker", "Git", "Linux"]', 1, 'https://luisfernandez.dev', 'https://github.com/luisfernandez', 'https://linkedin.com/in/luisfernandez', 'part-time', 'Concepción, Chile', '["Español", "Inglés"]', 4.3),
(17, 'Ingeniería Civil en Informática', 9, 2024, 'approved', 3, 1, 6.5, 3, 150, '["Flutter", "Dart", "Firebase", "Google Cloud", "Git", "REST API"]', 2, 'https://pedrolopez.dev', 'https://github.com/pedrolopez', 'https://linkedin.com/in/pedrolopez', 'flexible', 'Valparaíso, Chile', '["Español", "Inglés"]', 4.4),
(18, 'Ingeniería en Informática', 6, 2026, 'approved', 2, 0, 6.0, 1, 70, '["Java", "Spring", "Oracle", "Maven", "Git", "JUnit"]', 1, 'https://martaruiz.dev', 'https://github.com/martaruiz', 'https://linkedin.com/in/martaruiz', 'part-time', 'Santiago, Chile', '["Español", "Inglés"]', 4.2);

-- =====================================================
-- INSERTAR PROYECTOS
-- =====================================================
INSERT INTO projects (company_id, title, description, requirements, skills_required, duration, difficulty, api_level, max_students, current_students, applications_count, status, deadline, start_date, end_date, budget, total_hours) VALUES
(1, 'Desarrollo Web Frontend', 'Crear una aplicación web moderna con React y TypeScript para gestión de inventarios empresariales con interfaz intuitiva y responsive', '["Portfolio requerido", "GitHub activo", "Conocimientos de TypeScript"]', '["React", "TypeScript", "Material-UI", "Git", "REST API"]', '3 meses', 'intermediate', 3, 2, 2, 8, 'in-progress', '2024-05-01', '2024-02-01', NULL, 120),
(1, 'API REST con Django', 'Desarrollar una API REST completa para sistema de gestión de usuarios con autenticación JWT y documentación automática', '["Experiencia previa", "Entrevista obligatoria", "Conocimientos de Django"]', '["Python", "Django", "PostgreSQL", "REST API", "JWT", "Swagger"]', '4 meses', 'advanced', 4, 1, 1, 5, 'in-progress', '2024-07-01', '2024-03-01', NULL, 160),
(2, 'App Móvil React Native', 'Aplicación móvil para gestión de tareas y proyectos con sincronización en tiempo real y notificaciones push', '["Portfolio requerido", "Experiencia en React Native"]', '["React Native", "JavaScript", "Firebase", "Redux", "Push Notifications"]', '2 meses', 'beginner', 2, 3, 1, 12, 'open', '2024-06-01', '2024-04-01', NULL, 80),
(2, 'Sistema de Machine Learning', 'Implementar algoritmos de ML para análisis de datos de ventas con visualizaciones interactivas y reportes automáticos', '["Certificaciones", "Experiencia previa", "Conocimientos de estadística"]', '["Python", "TensorFlow", "Pandas", "Scikit-learn", "Matplotlib", "Jupyter"]', '5 meses', 'advanced', 5, 1, 0, 3, 'open', '2024-08-01', '2024-03-01', NULL, 200),
(3, 'E-commerce Platform', 'Plataforma de comercio electrónico completa con sistema de pagos, gestión de inventarios y panel administrativo', '["GitHub activo", "Entrevista obligatoria", "Experiencia en e-commerce"]', '["Vue.js", "Laravel", "MySQL", "Bootstrap", "Stripe API", "Redis"]', '6 meses', 'intermediate', 3, 2, 0, 6, 'draft', '2024-09-01', '2024-03-01', NULL, 240),
(4, 'Sistema de Gestión de Inventarios', 'Sistema completo para gestión de inventarios empresariales con códigos de barras, reportes y alertas automáticas', '["Experiencia en Java", "Conocimientos de bases de datos"]', '["Java", "Spring Boot", "PostgreSQL", "JUnit", "Maven", "REST API"]', '3 meses', 'intermediate', 3, 1, 1, 4, 'completed', '2024-01-15', '2023-10-15', '2024-01-15', 120),
(5, 'Dashboard de Analytics', 'Dashboard interactivo para análisis de datos empresariales con gráficos dinámicos y exportación de reportes', '["Conocimientos de BI", "Experiencia en visualización"]', '["Power BI", "SQL", "Python", "Tableau", "DAX", "M Query"]', '4 meses', 'advanced', 4, 2, 0, 7, 'open', '2024-07-15', '2024-03-15', NULL, 160),
(6, 'Plataforma de E-learning', 'Desarrollo de plataforma web para cursos online con sistema de videoconferencias y seguimiento de progreso', '["Experiencia en desarrollo web", "Conocimientos de educación"]', '["Vue.js", "Laravel", "PostgreSQL", "WebRTC", "Socket.io", "AWS"]', '5 meses', 'intermediate', 3, 2, 0, 8, 'open', '2024-08-15', '2024-03-15', NULL, 200),
(7, 'App de Gestión de Tareas', 'Aplicación móvil para gestión de tareas y proyectos con colaboración en tiempo real y integración con calendarios', '["Experiencia en Flutter", "Conocimientos de Firebase"]', '["Flutter", "Firebase", "Dart", "Google Calendar API", "Real-time Database"]', '3 meses', 'intermediate', 3, 1, 0, 5, 'open', '2024-06-15', '2024-03-15', NULL, 120),
(4, 'Sistema de Reservas', 'Sistema de reservas para hoteles y restaurantes con confirmación automática y gestión de disponibilidad', '["Experiencia en Java", "Conocimientos de sistemas de reservas"]', '["Java", "Spring", "Oracle", "JSP", "Bootstrap", "Email API"]', '4 meses', 'intermediate', 3, 1, 0, 6, 'paused', '2024-07-30', '2024-03-01', NULL, 160);

-- =====================================================
-- INSERTAR POSTULACIONES
-- =====================================================
INSERT INTO applications (project_id, student_id, status, cover_letter, applied_at) VALUES
(1, 1, 'accepted', 'Me interesa mucho este proyecto. Tengo experiencia en React y TypeScript, y he trabajado en proyectos similares. Mi portfolio muestra mi capacidad para crear interfaces modernas y responsivas.', '2024-01-15'),
(1, 2, 'accepted', 'Soy estudiante de la PUC y tengo experiencia en desarrollo web. He trabajado con Material-UI y tengo un buen manejo de Git. Me gustaría contribuir a este proyecto.', '2024-01-16'),
(2, 3, 'accepted', 'Tengo 3 años de experiencia en Python y Django. He desarrollado APIs REST y tengo conocimientos de PostgreSQL. Mi experiencia incluye autenticación JWT.', '2024-01-10'),
(3, 1, 'pending', 'Me gustaría participar en este proyecto móvil. Tengo experiencia en React Native y me interesa aprender más sobre Firebase y notificaciones push.', '2024-01-20'),
(3, 4, 'pending', 'Tengo experiencia en React Native y he trabajado con Redux. Me interesa mucho este proyecto y creo que puedo aportar valor significativo.', '2024-01-21'),
(3, 5, 'pending', 'Soy estudiante de la USACH y me interesa el desarrollo móvil. Aunque soy principiante, tengo mucha motivación y aprendo rápido.', '2024-01-22'),
(4, 3, 'accepted', 'Tengo experiencia en machine learning y análisis de datos. He trabajado con TensorFlow y Pandas. Mi tesis fue sobre análisis predictivo.', '2024-01-05'),
(5, 4, 'pending', 'Me interesa mucho el desarrollo de e-commerce. Tengo experiencia en Vue.js y Laravel. He trabajado con sistemas de pagos antes.', '2024-01-25'),
(6, 1, 'accepted', 'Tengo experiencia en Java y Spring Boot. He desarrollado sistemas empresariales y tengo conocimientos sólidos de bases de datos.', '2023-10-10'),
(7, 2, 'pending', 'Me interesa el análisis de datos y business intelligence. Tengo experiencia en Power BI y SQL. Me gustaría aplicar mis conocimientos en este proyecto.', '2024-01-30'),
(7, 3, 'pending', 'Tengo experiencia en Power BI y SQL. He creado dashboards para empresas y tengo conocimientos de DAX. Me interesa mucho este proyecto.', '2024-01-31'),
(8, 5, 'pending', 'Tengo experiencia en Vue.js y Laravel. Me interesa el desarrollo de plataformas educativas y tengo conocimientos de WebRTC.', '2024-02-01'),
(9, 6, 'pending', 'Tengo experiencia en Flutter y Firebase. He desarrollado aplicaciones móviles y me interesa la colaboración en tiempo real.', '2024-02-02'),
(10, 7, 'pending', 'Tengo experiencia en Java y Spring. He trabajado con sistemas de reservas antes y tengo conocimientos de Oracle.', '2024-02-03');

-- =====================================================
-- INSERTAR EVALUACIONES
-- =====================================================
INSERT INTO evaluations (project_id, student_id, evaluator_id, type, status, overall_rating, comments, strengths, areas_for_improvement, due_date, completed_date) VALUES
(1, 1, 1, 'final', 'completed', 4.5, 'Excelente progreso en el desarrollo frontend. Muestra buena comprensión de React y TypeScript. La calidad del código es muy buena y la documentación está bien estructurada. Se sugiere mejorar la comunicación en las reuniones de equipo.', '["React", "TypeScript", "Git", "Documentación", "Calidad de código"]', '["Comunicación", "Testing", "Performance"]', '2024-01-15', '2024-01-14'),
(1, 2, 1, 'final', 'completed', 4.5, 'Desarrollo excepcional del backend. API bien estructurada y documentada. Excelente manejo de la base de datos y buenas prácticas de desarrollo. Muy profesional en todo el proceso.', '["Django", "PostgreSQL", "REST API", "Documentación", "Buenas prácticas"]', '["Performance optimization", "Testing unitario"]', '2024-01-25', '2024-01-24'),
(2, 3, 1, 'final', 'completed', 4.8, 'Excelente trabajo en la implementación de la API. Código limpio y bien documentado. Implementó todas las funcionalidades requeridas y más. Muy recomendado para futuros proyectos.', '["Python", "Django", "PostgreSQL", "Testing", "Documentación"]', '["Performance", "Security"]', '2024-01-20', '2024-01-19'),
(6, 1, 4, 'final', 'completed', 4.2, 'Buen trabajo en el sistema de inventarios. Cumplió con los requerimientos básicos y entregó a tiempo. Necesita mejorar en testing y documentación.', '["Java", "Spring Boot", "SQL", "Cumplimiento de plazos"]', '["Testing", "Documentación", "Código limpio"]', '2024-01-10', '2024-01-09'),
(3, 1, 2, 'intermediate', 'pending', NULL, NULL, NULL, NULL, '2024-02-15', NULL);

-- =====================================================
-- INSERTAR CATEGORÍAS DE EVALUACIÓN
-- =====================================================
INSERT INTO evaluation_categories (evaluation_id, category_name, rating) VALUES
(1, 'Calidad del Código', 4.5),
(1, 'Cumplimiento de Plazos', 5),
(1, 'Trabajo en Equipo', 4),
(1, 'Comunicación', 4.5),
(1, 'Documentación', 4),
(1, 'Innovación', 4.5),
(2, 'Análisis de Datos', 5),
(2, 'Machine Learning', 4.5),
(2, 'Visualización', 4.8),
(2, 'Documentación', 4.5),
(2, 'Presentación', 5),
(3, 'Desarrollo Backend', 4.8),
(3, 'Base de Datos', 4.7),
(3, 'Testing', 4.5),
(3, 'Documentación', 4.6),
(4, 'Desarrollo Backend', 4.2),
(4, 'Base de Datos', 4.0),
(4, 'Testing', 4.1),
(4, 'Documentación', 4.3);

-- =====================================================
-- INSERTAR CALIFICACIONES MUTUAS
-- =====================================================
INSERT INTO ratings (rater_id, rated_id, project_id, rating, comment, category) VALUES
(1, 8, 1, 4.5, 'Excelente trabajo en el proyecto. Muy profesional y responsable. Siempre entregó a tiempo y con calidad.', 'overall'),
(8, 1, 1, 4.8, 'Empresa muy profesional, excelente comunicación y apoyo. Los mentores fueron muy claros con los requerimientos.', 'overall'),
(1, 9, 1, 4.2, 'Buen trabajo, necesita mejorar en documentación. Técnicamente muy competente.', 'overall'),
(9, 1, 1, 4.0, 'Buena empresa, pero los deadlines son muy ajustados. El equipo fue muy colaborativo.', 'overall'),
(2, 10, 2, 4.7, 'Estudiante excepcional, muy recomendado. Excelente habilidades técnicas y de comunicación.', 'overall'),
(10, 2, 2, 4.5, 'Excelente experiencia trabajando con esta empresa. Muy profesional y organizada.', 'overall'),
(4, 8, 6, 4.2, 'Buen trabajo técnico, cumplió con los requerimientos. Necesita mejorar en testing.', 'technical'),
(8, 4, 6, 4.0, 'Empresa seria y profesional. Buena comunicación durante el proyecto.', 'overall'),
(2, 10, 4, 4.6, 'Excelente trabajo en machine learning. Muy innovador y técnicamente sólido.', 'technical'),
(10, 2, 4, 4.4, 'Empresa muy innovadora. Excelente ambiente de trabajo y aprendizaje.', 'overall');

-- =====================================================
-- INSERTAR STRIKES
-- =====================================================
INSERT INTO strikes (project_id, student_id, reported_by, type, severity, description, evidence, status, resolution, resolved_date) VALUES
(1, 1, 1, 'attendance', 'medium', 'Falta injustificada a reunión de seguimiento del proyecto sin previo aviso', 'Registro de asistencia y comunicación con el estudiante', 'active', NULL, NULL),
(2, 3, 1, 'deadline', 'high', 'Entrega tardía de milestone crítico sin justificación previa', 'Documentación de fechas de entrega y comunicación', 'resolved', 'El estudiante presentó justificación médica válida', '2024-01-12'),
(3, 4, 2, 'quality', 'low', 'Código entregado no cumple con estándares de calidad establecidos', 'Revisión de código y documentación de estándares', 'active', NULL, NULL),
(6, 1, 4, 'deadline', 'high', 'Entrega tardía de milestone crítico sin comunicación previa', 'Documentación de fechas de entrega', 'resolved', 'El estudiante presentó justificación válida', '2023-12-15'),
(1, 2, 1, 'behavior', 'medium', 'Comportamiento inapropiado en reunión de equipo', 'Reporte del equipo de trabajo', 'active', NULL, NULL);

-- =====================================================
-- INSERTAR NOTIFICACIONES
-- =====================================================
INSERT INTO notifications (user_id, title, message, type, related_url) VALUES
(1, 'Nueva Postulación', 'Juan Pérez se ha postulado a tu proyecto "Desarrollo Web Frontend"', 'info', '/projects/1/applications'),
(1, 'Evaluación Pendiente', 'Tienes una evaluación pendiente para el proyecto "API REST con Django"', 'warning', '/evaluations/2'),
(8, 'Entrevista Programada', 'Tu entrevista para el proyecto "Desarrollo Web Frontend" está programada para el 15 de enero', 'success', '/interviews/1'),
(9, 'Proyecto Aceptado', '¡Felicitaciones! Has sido aceptado en el proyecto "App Móvil React Native"', 'success', '/projects/3'),
(2, 'Strike Reportado', 'Se ha reportado un strike en el proyecto "API REST con Django"', 'error', '/strikes/2'),
(8, 'Evaluación Completada', 'Tu evaluación para el proyecto "Desarrollo Web Frontend" ha sido completada', 'success', '/evaluations/1'),
(9, 'Nuevo Proyecto Disponible', 'Hay un nuevo proyecto disponible que coincide con tu perfil', 'info', '/projects/7'),
(10, 'Strike Asignado', 'Se te ha asignado un strike por incumplimiento de deadline', 'error', '/strikes/2'),
(11, 'Proyecto Completado', 'El proyecto "Sistema de Gestión de Inventarios" ha sido marcado como completado', 'success', '/projects/6'),
(12, 'Suspensión Temporal', 'Tu cuenta ha sido suspendida temporalmente por acumular 3 strikes', 'error', '/profile'),
(13, 'Aprobación Pendiente', 'Tu solicitud de registro está siendo revisada por el administrador', 'info', '/profile'),
(14, 'Nueva Evaluación', 'Tienes una nueva evaluación disponible para completar', 'warning', '/evaluations'),
(15, 'Horas Aprobadas', 'Tus horas trabajadas han sido aprobadas por el supervisor', 'success', '/work-hours');

-- =====================================================
-- INSERTAR REGISTRO DISCIPLINARIO
-- =====================================================
INSERT INTO disciplinary_records (student_id, type, reason, description, assigned_by) VALUES
(1, 'strike', 'Inasistencia a reunión de seguimiento', 'No se presentó a la reunión de seguimiento del proyecto sin previo aviso. Se intentó contactar sin respuesta.', 'TechCorp Solutions'),
(2, 'strike', 'Entrega tardía de milestone crítico', 'Entregó el milestone crítico 3 días después de la fecha límite sin justificación previa. Afectó el cronograma del proyecto.', 'TechCorp Solutions'),
(3, 'strike', 'Entrega tardía de milestone crítico', 'Entregó el milestone crítico 5 días después de la fecha límite. Presentó justificación médica posteriormente.', 'TechCorp Solutions'),
(4, 'strike', 'Código de baja calidad', 'El código entregado no cumple con los estándares de calidad establecidos. Requiere refactorización significativa.', 'Innovate Labs'),
(5, 'strike', 'Comportamiento inapropiado', 'Comportamiento inapropiado durante reunión de equipo. Interrumpió presentaciones y mostró falta de respeto.', 'TechCorp Solutions'),
(1, 'commendation', 'Excelente desempeño en proyecto', 'Destacado por su profesionalismo y calidad de trabajo en el proyecto de inventarios. Superó las expectativas.', 'Digital Dynamics'),
(2, 'commendation', 'Excelente trabajo en equipo', 'Demostró excelentes habilidades de trabajo en equipo y comunicación. Fue un líder natural en el proyecto.', 'TechCorp Solutions'),
(3, 'commendation', 'Innovación técnica', 'Implementó soluciones innovadoras que mejoraron significativamente el rendimiento del sistema.', 'Innovate Labs'),
(6, 'warning', 'Falta de comunicación', 'Necesita mejorar la comunicación con el equipo. No reporta progresos regularmente.', 'DataCorp'),
(7, 'commendation', 'Mejora significativa', 'Mostró una mejora significativa en sus habilidades técnicas durante el proyecto.', 'EduTech Solutions');

-- =====================================================
-- INSERTAR HORAS TRABAJADAS
-- =====================================================
INSERT INTO work_hours (student_id, project_id, hours_worked, date_worked, description, status, approved_by, approved_at) VALUES
(1, 1, 8.0, '2024-01-15', 'Desarrollo de componentes React y implementación de TypeScript', 'approved', 1, '2024-01-16'),
(1, 1, 6.5, '2024-01-16', 'Implementación de TypeScript y configuración de Material-UI', 'approved', 1, '2024-01-17'),
(1, 1, 7.0, '2024-01-17', 'Testing y debugging de componentes, optimización de rendimiento', 'approved', 1, '2024-01-18'),
(2, 1, 8.0, '2024-01-15', 'Desarrollo de backend con Django y configuración de base de datos', 'approved', 1, '2024-01-16'),
(2, 1, 7.5, '2024-01-16', 'Implementación de API endpoints y autenticación JWT', 'approved', 1, '2024-01-17'),
(3, 2, 8.0, '2024-01-10', 'Configuración inicial de Django y estructura del proyecto', 'approved', 1, '2024-01-11'),
(3, 2, 7.0, '2024-01-11', 'Desarrollo de modelos de datos y migraciones', 'approved', 1, '2024-01-12'),
(1, 6, 8.0, '2023-12-10', 'Desarrollo de sistema de inventarios con Spring Boot', 'approved', 4, '2023-12-11'),
(1, 6, 7.5, '2023-12-11', 'Testing del sistema y documentación técnica', 'approved', 4, '2023-12-12'),
(1, 3, 6.0, '2024-01-20', 'Configuración de React Native y Firebase', 'pending', NULL, NULL),
(2, 3, 7.0, '2024-01-21', 'Desarrollo de componentes móviles', 'pending', NULL, NULL),
(3, 4, 8.0, '2024-01-05', 'Análisis exploratorio de datos y preparación', 'approved', 2, '2024-01-06'),
(3, 4, 7.5, '2024-01-06', 'Implementación de modelos de machine learning', 'approved', 2, '2024-01-07'),
(4, 5, 6.5, '2024-01-25', 'Configuración de Vue.js y Laravel', 'pending', NULL, NULL),
(5, 6, 8.0, '2023-12-15', 'Desarrollo de API REST con Java Spring', 'approved', 4, '2023-12-16');

-- =====================================================
-- INSERTAR ENTREVISTAS
-- =====================================================
INSERT INTO interviews (project_id, student_id, interviewer_id, type, status, outcome, scheduled_date, duration, location, notes, feedback, next_steps, rating) VALUES
(1, 1, 1, 'technical', 'completed', 'passed', '2024-01-15T14:00:00', 60, 'Sala de Reuniones A', 'Entrevista técnica enfocada en React y TypeScript. El candidato demostró excelente conocimiento técnico.', 'Excelente conocimiento técnico. Buenas habilidades de resolución de problemas. Muy recomendado.', 'Contratación inmediata para el proyecto', 5),
(1, 2, 1, 'final', 'scheduled', 'pending', '2024-01-20T10:00:00', 90, 'Zoom Meeting', 'Entrevista final para evaluación completa del candidato', '', '', NULL),
(3, 3, 2, 'behavioral', 'cancelled', 'failed', '2024-01-18T16:00:00', 45, 'Oficina Principal', 'Entrevista cancelada por el estudiante sin previo aviso', 'No se presentó a la entrevista programada', 'No proceder con la candidatura', 1),
(2, 3, 1, 'technical', 'completed', 'passed', '2024-01-10T15:00:00', 75, 'Sala de Desarrollo', 'Entrevista técnica sobre Python y Django. Excelente rendimiento.', 'Excelente conocimiento de Python y Django. Experiencia sólida en desarrollo backend.', 'Aprobado para el proyecto', 5),
(4, 3, 2, 'technical', 'completed', 'passed', '2024-01-05T11:00:00', 60, 'Sala de ML', 'Entrevista técnica sobre machine learning y análisis de datos', 'Conocimientos sólidos en ML y análisis de datos. Experiencia práctica demostrada.', 'Aprobado para el proyecto', 4),
(6, 1, 4, 'technical', 'completed', 'passed', '2023-10-10T13:00:00', 60, 'Oficina Principal', 'Entrevista técnica sobre Java y Spring Boot', 'Buen conocimiento de Java y Spring. Experiencia en desarrollo empresarial.', 'Aprobado para el proyecto', 4),
(7, 2, 5, 'technical', 'scheduled', 'pending', '2024-02-05T14:00:00', 60, 'Zoom Meeting', 'Entrevista técnica sobre Power BI y análisis de datos', '', '', NULL),
(8, 5, 6, 'technical', 'scheduled', 'pending', '2024-02-10T10:00:00', 60, 'Sala de Desarrollo', 'Entrevista técnica sobre Vue.js y Laravel', '', '', NULL);

-- =====================================================
-- ACTUALIZAR ESTADÍSTICAS
-- =====================================================
EXEC sp_UpdateProjectStats 1;
EXEC sp_UpdateProjectStats 2;
EXEC sp_UpdateProjectStats 3;
EXEC sp_UpdateProjectStats 4;
EXEC sp_UpdateProjectStats 5;
EXEC sp_UpdateProjectStats 6;
EXEC sp_UpdateProjectStats 7;
EXEC sp_UpdateProjectStats 8;
EXEC sp_UpdateProjectStats 9;
EXEC sp_UpdateProjectStats 10;

-- =====================================================
-- INSERTAR EVENTOS DE CALENDARIO
-- =====================================================
INSERT INTO calendar_events (title, description, type, start_date, end_date, duration, location, priority, status, project_id, company_id, student_id, created_by, attendees, notes, reminder_sent, reminder_date)
VALUES
('Entrevista con TechCorp Solutions', 'Entrevista técnica para evaluar habilidades en React y Node.js', 'interview', '2024-01-15T10:00:00', '2024-01-15T11:00:00', '1 hora', 'Remoto (Zoom)', 'high', 'upcoming', 1, 1, 1, 1, '["Juan Pérez", "María González"]', 'Preparar preguntas técnicas sobre React.', 0, NULL),
('Reunión de Progreso Semanal', 'Reunión semanal para revisar el progreso del proyecto', 'meeting', '2024-01-17T14:00:00', '2024-01-17T14:30:00', '30 minutos', 'Remoto (Teams)', 'medium', 'completed', 1, 1, 1, 1, '["Juan Pérez", "Carlos Rodríguez"]', 'Revisar avances y bloqueos.', 1, '2024-01-16T10:00:00'),
('Entrega del Módulo de Autenticación', 'Entrega final del módulo de autenticación con JWT', 'deadline', '2024-01-20T23:59:00', '2024-01-20T23:59:00', NULL, NULL, 'high', 'upcoming', 1, 1, NULL, 1, NULL, 'Entrega obligatoria para todos los estudiantes.', 0, NULL),
('Presentación Final del Proyecto', 'Presentación final del proyecto a los stakeholders', 'presentation', '2024-01-22T15:00:00', '2024-01-22T16:00:00', '1 hora', 'Oficinas de Digital Dynamics', 'high', 'upcoming', 4, 4, NULL, 4, '["Laura Martínez", "Luis Martínez"]', 'Preparar demo y slides.', 0, NULL),
('Revisión de Código', 'Revisión del código del módulo de reportes', 'review', '2024-01-19T16:00:00', '2024-01-19T17:00:00', '1 hora', 'Remoto (Discord)', 'medium', 'upcoming', 1, 1, 1, 1, '["Juan Pérez", "María González"]', 'Revisar pull requests pendientes.', 0, NULL),
('Recordatorio de Entrega', 'Recuerda que tienes una entrega pendiente para el proyecto actual.', 'reminder', '2024-01-18T09:00:00', '2024-01-18T09:15:00', '15 minutos', NULL, 'low', 'upcoming', 1, 1, 1, 1, '["Juan Pérez"]', 'Enviar recordatorio automático.', 1, '2024-01-17T08:00:00');

-- =====================================================
-- INSERTAR NOTIFICACIONES MASIVAS
-- =====================================================
INSERT INTO mass_notifications (created_by, title, message, type, priority, target_roles, target_filters, status, scheduled_at, sent_at, total_recipients, sent_count)
VALUES
(1, 'Bienvenida a LeanMaker', '¡Bienvenidos a la plataforma LeanMaker! Explora los proyectos y oportunidades disponibles.', 'info', 'medium', '["student","company"]', '{"status":"active"}', 'sent', '2024-01-01T09:00:00', '2024-01-01T09:05:00', 18, 18),
(1, 'Mantenimiento Programado', 'La plataforma estará en mantenimiento el próximo sábado de 2:00 AM a 6:00 AM.', 'warning', 'high', '["student","company","admin"]', NULL, 'sent', '2024-01-10T22:00:00', '2024-01-10T22:05:00', 20, 20),
(1, 'Nueva Funcionalidad', 'Ahora puedes calificar a las empresas y recibir feedback detallado en tu perfil.', 'success', 'medium', '["student"]', NULL, 'sent', '2024-01-15T10:00:00', '2024-01-15T10:05:00', 11, 11);

-- =====================
-- NIVELES TRL
-- =====================
INSERT INTO trl_levels (nivel, descripcion, requisitos) VALUES
('1', 'Principios básicos observados', 'Documentación de principios científicos'),
('2', 'Concepto de tecnología formulado', 'Definición de aplicación tecnológica'),
('3', 'Prueba experimental de concepto', 'Validación en laboratorio'),
('4', 'Validación de componentes en laboratorio', 'Prototipo funcional'),
('5', 'Validación en entorno relevante', 'Pruebas en entorno simulado'),
('6', 'Demostración de sistema/proceso en entorno relevante', 'Prototipo en entorno real'),
('7', 'Demostración de sistema/proceso en entorno real', 'Piloto en condiciones reales'),
('8', 'Sistema completo y calificado', 'Validación final del sistema'),
('9', 'Sistema probado y operativo', 'Implementación comercial');

-- =====================
-- ÁREAS
-- =====================
INSERT INTO areas (nombre, descripcion) VALUES
('Tecnología', 'Proyectos de software, hardware, IA, etc.'),
('Educación', 'Proyectos educativos y de formación'),
('Salud', 'Proyectos de salud y biotecnología'),
('Energía', 'Proyectos de energías renovables y eficiencia energética');

-- =====================
-- ESTADOS DE PROYECTO
-- =====================
INSERT INTO project_status (nombre, descripcion) VALUES
('open', 'Proyecto abierto a postulaciones'),
('in-progress', 'Proyecto en desarrollo'),
('completed', 'Proyecto finalizado'),
('paused', 'Proyecto pausado'),
('cancelled', 'Proyecto cancelado');

-- =====================
-- PROYECTOS
-- =====================
INSERT INTO projects (company_id, status_id, area_id, title, description, trl_id, api_level, required_hours, start_date, estimated_end_date) VALUES
(1, 1, 1, 'Plataforma de Aprendizaje IA', 'Desarrollo de una plataforma educativa con IA para personalización de contenidos.', 3, 2, 120, '2024-03-01', '2024-06-01'),
(2, 2, 2, 'App de Salud Preventiva', 'Aplicación móvil para monitoreo de salud y hábitos saludables.', 4, 3, 200, '2024-02-15', '2024-07-15');

-- =====================
-- HISTORIAL DE ESTADOS DE PROYECTO
-- =====================
INSERT INTO project_status_history (project_id, status_id, user_id, comentario) VALUES
(1, 1, 1, 'Proyecto creado y abierto a postulaciones'),
(1, 2, 1, 'Proyecto iniciado por la empresa'),
(2, 1, 2, 'Proyecto creado y abierto a postulaciones');

-- =====================
-- POSTULACIONES Y ASIGNACIONES
-- =====================
INSERT INTO applications (project_id, student_id, status) VALUES
(1, 1, 'accepted'),
(1, 2, 'pending'),
(2, 3, 'accepted');

INSERT INTO assignments (application_id, fecha_inicio, tareas, estado) VALUES
(1, '2024-03-05', 'Desarrollo de backend y API', 'en curso'),
(3, '2024-02-20', 'Diseño de interfaz y pruebas', 'en curso');

-- =====================
-- HORAS Y VALIDACIONES
-- =====================
INSERT INTO work_hours (assignment_id, student_id, project_id, company_id, fecha, horas_trabajadas, descripcion, estado_validacion, validador_id) VALUES
(1, 1, 1, 1, '2024-03-10', 6, 'Implementación de endpoints REST', 'aprobado', 1),
(1, 1, 1, 1, '2024-03-11', 5, 'Pruebas unitarias y documentación', 'pendiente', 1),
(2, 3, 2, 2, '2024-02-25', 8, 'Diseño de pantallas principales', 'aprobado', 2);

-- =====================
-- EVALUACIONES Y EXPERIENCIA
-- =====================
INSERT INTO evaluations (assignment_id, calificacion, comentarios) VALUES
(1, 5, 'Excelente desempeño en desarrollo backend.'),
(2, 4, 'Buen trabajo en diseño, mejorar tiempos de entrega.');

INSERT INTO student_profiles (student_id, experiencia_laboral, habilidades, portafolio_url, biografia) VALUES
(1, '2 años en desarrollo web', 'JavaScript, Python, SQL', 'https://portfolio1.com', 'Apasionado por la tecnología y la educación.'),
(2, '1 año en diseño UI/UX', 'Figma, Adobe XD, CSS', 'https://portfolio2.com', 'Creativo y detallista en interfaces.'),
(3, 'Prácticas en salud digital', 'Flutter, Firebase, UX', 'https://portfolio3.com', 'Interesado en soluciones de salud.');

INSERT INTO project_experience (profile_id, project_id, company_id, rol_desempeñado, descripcion_tareas, habilidades_aplicadas, fecha_inicio, horas_trabajadas, calificacion_empresa, comentarios_empresa) VALUES
(1, 1, 1, 'Backend Developer', 'Desarrollo de API REST y lógica de negocio', 'Python, Django, REST', '2024-03-05', 60, 5, 'Excelente colaboración y resultados.'),
(2, 2, 2, 'UI Designer', 'Diseño de pantallas y experiencia de usuario', 'Figma, UX', '2024-02-20', 40, 4, 'Buen trabajo, mejorar comunicación.');

-- =====================
-- STRIKES Y CERTIFICADOS
-- =====================
INSERT INTO strikes (student_id, motivo, estado, admin_id) VALUES
(2, 'Entrega tardía de entregable', 'activo', 1),
(3, 'Falta injustificada a reunión', 'resuelto', 1);

INSERT INTO certificates (student_id, nombre, archivo_url, tipo_certificado, valido_hasta) VALUES
(1, 'Certificado Python', 'https://certs.com/python1.pdf', 'Curso', '2025-03-01'),
(2, 'Certificado UX', 'https://certs.com/ux1.pdf', 'Diplomado', '2026-01-01');

-- =====================
-- NOTIFICACIONES Y CALENDARIO
-- =====================
INSERT INTO notifications (user_id, mensaje, tipo) VALUES
(1, 'Tienes una nueva asignación en el proyecto Plataforma de Aprendizaje IA', 'proyecto'),
(2, 'Tu certificado ha sido aprobado', 'sistema'),
(3, 'Tienes una reunión programada para el proyecto App de Salud Preventiva', 'reunion');

INSERT INTO calendar_events (user_id, titulo, descripcion, fecha, hora_inicio, hora_fin, tipo, link_reunion) VALUES
(1, 'Reunión de Kickoff', 'Inicio del proyecto con el equipo', '2024-03-06', '10:00', '11:00', 'reunion', 'https://meet.com/kickoff'),
(2, 'Entrega de prototipo', 'Presentación del prototipo funcional', '2024-04-01', '15:00', '16:00', 'presentacion', NULL);

-- =====================
-- TRL: PREGUNTAS Y RESPUESTAS
-- =====================
INSERT INTO trl_questions (texto_pregunta, tipo_respuesta, nivel_trl) VALUES
('¿El principio científico está claramente definido?', 'boolean', 1),
('¿Existe un prototipo funcional?', 'boolean', 4),
('¿Se ha probado el sistema en entorno real?', 'boolean', 7);

INSERT INTO trl_answers (question_id, project_id, respuesta) VALUES
(1, 1, 'true'),
(2, 1, 'true'),
(3, 2, 'false');

GO

PRINT 'Datos de ejemplo PULIDOS insertados correctamente!';
PRINT 'Total de usuarios: ' + CAST((SELECT COUNT(*) FROM users) AS NVARCHAR(10));
PRINT 'Total de empresas: ' + CAST((SELECT COUNT(*) FROM companies) AS NVARCHAR(10));
PRINT 'Total de estudiantes: ' + CAST((SELECT COUNT(*) FROM students) AS NVARCHAR(10));
PRINT 'Total de proyectos: ' + CAST((SELECT COUNT(*) FROM projects) AS NVARCHAR(10));
PRINT 'Total de postulaciones: ' + CAST((SELECT COUNT(*) FROM applications) AS NVARCHAR(10)); 
PRINT 'Total de evaluaciones: ' + CAST((SELECT COUNT(*) FROM evaluations) AS NVARCHAR(10));
PRINT 'Total de strikes: ' + CAST((SELECT COUNT(*) FROM strikes) AS NVARCHAR(10));
PRINT 'Total de notificaciones: ' + CAST((SELECT COUNT(*) FROM notifications) AS NVARCHAR(10));
PRINT 'Total de horas trabajadas: ' + CAST((SELECT COUNT(*) FROM work_hours) AS NVARCHAR(10));
PRINT 'Total de entrevistas: ' + CAST((SELECT COUNT(*) FROM interviews) AS NVARCHAR(10)); 