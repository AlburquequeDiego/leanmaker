-- =====================================================
-- SCRIPT DE INSERCIÓN DE DATOS DE PRUEBA - LEANMAKER
-- SQL Server Azure - Compatible con tu schema.sql
-- Incluye: 2 Administradores, 15 Estudiantes, 15 Empresas
-- =====================================================
-- NOTAS IMPORTANTES:
-- 1. Las contraseñas están en formato hash de Django (pbkdf2_sha256). Si quieres cambiar la contraseña, debes actualizar el campo 'password' con el hash correcto.
--    Ejemplo: Para la contraseña 'admin123', puedes generar el hash en Django con:
--      from django.contrib.auth.hashers import make_password
--      print(make_password('admin123'))
-- 2. Si quieres usar contraseñas en texto plano para pruebas, deberás cambiar la lógica de autenticación en Django (NO recomendado en producción).
-- 3. Todos los usuarios quedan activos y verificados.
-- 4. Puedes ejecutar este script directamente en SSMS.

-- =========================
-- 2 Administradores
-- =========================
INSERT INTO users (id, email, password, role, first_name, last_name, username, is_active, is_staff, is_superuser, date_joined)
VALUES
  (NEWID(), 'admin1@leanmaker.cl', 'pbkdf2_sha256$600000$admin1$hash', 'admin', 'Admin', 'Uno', 'admin1', 1, 1, 1, GETDATE()),
  (NEWID(), 'admin2@leanmaker.cl', 'pbkdf2_sha256$600000$admin2$hash', 'admin', 'Admin', 'Dos', 'admin2', 1, 1, 1, GETDATE());

INSERT INTO admins (user_id, permissions)
SELECT id, '["all"]' FROM users WHERE email = 'admin1@leanmaker.cl';
INSERT INTO admins (user_id, permissions)
SELECT id, '["all"]' FROM users WHERE email = 'admin2@leanmaker.cl';

-- =========================
-- 15 Estudiantes
-- =========================
DECLARE @i INT = 1;
DECLARE @student_emails NVARCHAR(50);
DECLARE @student_names NVARCHAR(100);
DECLARE @student_lastnames NVARCHAR(100);
DECLARE @student_usernames NVARCHAR(50);
DECLARE @student_careers NVARCHAR(100);
DECLARE @student_semesters INT;
DECLARE @student_graduation_years INT;
DECLARE @student_gpas DECIMAL(3,2);
DECLARE @student_api_levels INT;
DECLARE @student_strikes INT;
DECLARE @student_hours INT;
DECLARE @student_projects INT;
DECLARE @student_ratings DECIMAL(3,2);

WHILE @i <= 15
BEGIN
    SET @student_emails = 'estudiante' + CAST(@i AS NVARCHAR(2)) + '@universidad.cl';
    SET @student_names = CASE @i
        WHEN 1 THEN 'Juan'
        WHEN 2 THEN 'María'
        WHEN 3 THEN 'Carlos'
        WHEN 4 THEN 'Ana'
        WHEN 5 THEN 'Luis'
        WHEN 6 THEN 'Sofía'
        WHEN 7 THEN 'Diego'
        WHEN 8 THEN 'Valentina'
        WHEN 9 THEN 'Andrés'
        WHEN 10 THEN 'Camila'
        WHEN 11 THEN 'Felipe'
        WHEN 12 THEN 'Isabella'
        WHEN 13 THEN 'Matías'
        WHEN 14 THEN 'Javiera'
        WHEN 15 THEN 'Nicolás'
    END;
    SET @student_lastnames = CASE @i
        WHEN 1 THEN 'González'
        WHEN 2 THEN 'Rodríguez'
        WHEN 3 THEN 'Silva'
        WHEN 4 THEN 'Martínez'
        WHEN 5 THEN 'López'
        WHEN 6 THEN 'Hernández'
        WHEN 7 THEN 'García'
        WHEN 8 THEN 'Pérez'
        WHEN 9 THEN 'Torres'
        WHEN 10 THEN 'Flores'
        WHEN 11 THEN 'Reyes'
        WHEN 12 THEN 'Morales'
        WHEN 13 THEN 'Castro'
        WHEN 14 THEN 'Ortiz'
        WHEN 15 THEN 'Jiménez'
    END;
    SET @student_usernames = 'estudiante' + CAST(@i AS NVARCHAR(2));
    SET @student_careers = CASE (@i % 5)
        WHEN 0 THEN 'Ingeniería Informática'
        WHEN 1 THEN 'Ingeniería Civil'
        WHEN 2 THEN 'Ingeniería Comercial'
        WHEN 3 THEN 'Diseño Gráfico'
        WHEN 4 THEN 'Administración de Empresas'
    END;
    SET @student_semesters = 4 + (@i % 6);
    SET @student_graduation_years = 2025 + (@i % 3);
    SET @student_gpas = 4.5 + (@i % 2);
    SET @student_api_levels = 1 + (@i % 4);
    SET @student_strikes = @i % 3;
    SET @student_hours = 40 + (@i * 2);
    SET @student_projects = @i % 4;
    SET @student_ratings = 4.0 + (@i % 2);

    INSERT INTO users (id, email, password, role, first_name, last_name, username, is_active, date_joined)
    VALUES (NEWID(), @student_emails, 'pbkdf2_sha256$600000$student' + CAST(@i AS NVARCHAR(2)) + '$hash', 'student', @student_names, @student_lastnames, @student_usernames, 1, GETDATE());

    INSERT INTO students (user_id, career, semester, graduation_year, status, api_level, strikes, gpa, completed_projects, total_hours, skills, experience_years, availability, location, languages, rating)
    VALUES (
        (SELECT id FROM users WHERE email = @student_emails),
        @student_careers,
        @student_semesters,
        @student_graduation_years,
        'approved',
        @student_api_levels,
        @student_strikes,
        @student_gpas,
        @student_projects,
        @student_hours,
        '["Python","Django"]',
        @i % 3,
        CASE (@i % 3) WHEN 0 THEN 'full-time' WHEN 1 THEN 'part-time' ELSE 'flexible' END,
        'Santiago',
        '["Español","Inglés"]',
        @student_ratings
    );

    SET @i = @i + 1;
END;

-- =========================
-- 15 Empresas
-- =========================
SET @i = 1;
DECLARE @company_emails NVARCHAR(50);
DECLARE @company_names NVARCHAR(100);
DECLARE @company_lastnames NVARCHAR(100);
DECLARE @company_usernames NVARCHAR(50);
DECLARE @company_names_full NVARCHAR(200);
DECLARE @company_descriptions NVARCHAR(MAX);
DECLARE @company_industries NVARCHAR(100);
DECLARE @company_sizes NVARCHAR(50);
DECLARE @company_websites NVARCHAR(200);
DECLARE @company_addresses NVARCHAR(MAX);
DECLARE @company_cities NVARCHAR(100);
DECLARE @company_founded_years INT;
DECLARE @company_ratings DECIMAL(3,2);
DECLARE @company_total_projects INT;
DECLARE @company_completed_projects INT;
DECLARE @company_hours_offered INT;
DECLARE @company_technologies NVARCHAR(MAX);
DECLARE @company_benefits NVARCHAR(MAX);
DECLARE @company_remote_policies NVARCHAR(50);
DECLARE @company_contact_emails NVARCHAR(254);
DECLARE @company_contact_phones NVARCHAR(20);

WHILE @i <= 15
BEGIN
    SET @company_emails = 'empresa' + CAST(@i AS NVARCHAR(2)) + '@empresa.cl';
    SET @company_names = CASE @i
        WHEN 1 THEN 'Roberto'
        WHEN 2 THEN 'Patricia'
        WHEN 3 THEN 'Miguel'
        WHEN 4 THEN 'Carmen'
        WHEN 5 THEN 'Alejandro'
        WHEN 6 THEN 'Elena'
        WHEN 7 THEN 'Francisco'
        WHEN 8 THEN 'Lucía'
        WHEN 9 THEN 'Ricardo'
        WHEN 10 THEN 'Adriana'
        WHEN 11 THEN 'Héctor'
        WHEN 12 THEN 'Mónica'
        WHEN 13 THEN 'Eduardo'
        WHEN 14 THEN 'Claudia'
        WHEN 15 THEN 'Fernando'
    END;
    SET @company_lastnames = CASE @i
        WHEN 1 THEN 'Mendoza'
        WHEN 2 THEN 'Vargas'
        WHEN 3 THEN 'Rojas'
        WHEN 4 THEN 'Díaz'
        WHEN 5 THEN 'Moreno'
        WHEN 6 THEN 'Alvarez'
        WHEN 7 THEN 'Romero'
        WHEN 8 THEN 'Navarro'
        WHEN 9 THEN 'Cruz'
        WHEN 10 THEN 'Medina'
        WHEN 11 THEN 'Cortés'
        WHEN 12 THEN 'Soto'
        WHEN 13 THEN 'Carrasco'
        WHEN 14 THEN 'Ruiz'
        WHEN 15 THEN 'Herrera'
    END;
    SET @company_usernames = 'empresa' + CAST(@i AS NVARCHAR(2));
    SET @company_names_full = 'Empresa ' + CAST(@i AS NVARCHAR(2));
    SET @company_descriptions = 'Descripción de la empresa ' + CAST(@i AS NVARCHAR(2));
    SET @company_industries = CASE (@i % 4)
        WHEN 0 THEN 'Tecnología'
        WHEN 1 THEN 'Marketing'
        WHEN 2 THEN 'Consultoría'
        WHEN 3 THEN 'Finanzas'
    END;
    SET @company_sizes = CASE (@i % 4)
        WHEN 0 THEN 'Startup'
        WHEN 1 THEN 'Pequeña'
        WHEN 2 THEN 'Mediana'
        WHEN 3 THEN 'Grande'
    END;
    SET @company_websites = 'https://empresa' + CAST(@i AS NVARCHAR(2)) + '.cl';
    SET @company_addresses = 'Av. Providencia ' + CAST(1000 + @i AS NVARCHAR(4)) + ', Santiago';
    SET @company_cities = 'Santiago';
    SET @company_founded_years = 2015 + (@i % 8);
    SET @company_ratings = 3.5 + (@i % 2);
    SET @company_total_projects = 5 + @i;
    SET @company_completed_projects = 3 + (@i % 5);
    SET @company_hours_offered = 100 + (@i * 10);
    SET @company_technologies = '["Python","React"]';
    SET @company_benefits = '["Horario flexible"]';
    SET @company_remote_policies = CASE (@i % 3) WHEN 0 THEN 'full-remote' WHEN 1 THEN 'hybrid' ELSE 'onsite' END;
    SET @company_contact_emails = 'contacto@empresa' + CAST(@i AS NVARCHAR(2)) + '.cl';
    SET @company_contact_phones = '+562200000' + CAST(@i AS NVARCHAR(2));

    INSERT INTO users (id, email, password, role, first_name, last_name, username, is_active, date_joined)
    VALUES (NEWID(), @company_emails, 'pbkdf2_sha256$600000$company' + CAST(@i AS NVARCHAR(2)) + '$hash', 'company', @company_names, @company_lastnames, @company_usernames, 1, GETDATE());

    INSERT INTO companies (user_id, company_name, description, industry, size, website, address, city, country, founded_year, verified, rating, total_projects, projects_completed, total_hours_offered, technologies_used, benefits_offered, remote_work_policy, contact_email, contact_phone, status)
    VALUES (
        (SELECT id FROM users WHERE email = @company_emails),
        @company_names_full,
        @company_descriptions,
        @company_industries,
        @company_sizes,
        @company_websites,
        @company_addresses,
        @company_cities,
        'Chile',
        @company_founded_years,
        1,
        @company_ratings,
        @company_total_projects,
        @company_completed_projects,
        @company_hours_offered,
        @company_technologies,
        @company_benefits,
        @company_remote_policies,
        @company_contact_emails,
        @company_contact_phones,
        'active'
    );

    SET @i = @i + 1;
END;

-- =========================
-- VERIFICACIÓN RÁPIDA
-- =========================
-- Puedes verificar los datos con:
-- SELECT role, COUNT(*) FROM users GROUP BY role;
-- SELECT COUNT(*) FROM students;
-- SELECT COUNT(*) FROM companies; 