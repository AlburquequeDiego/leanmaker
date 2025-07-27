"""
Configuración optimizada de base de datos para LeanMaker Backend
Optimizado para 3000 estudiantes + 1000 empresas
"""

import os
from django.conf import settings

# Configuración de base de datos optimizada para alta carga
DATABASE_CONFIG = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': os.getenv('DB_NAME', 'leanmaker_db'),
        'USER': os.getenv('DB_USER', 'tesisadministrador'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'Admin@tesis'),
        'HOST': os.getenv('DB_HOST', 'tesisservidor.database.windows.net'),
        'PORT': os.getenv('DB_PORT', '1433'),
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'TrustServerCertificate': 'yes',
            'Encrypt': 'yes',
            'connection_timeout': 30,
            'command_timeout': 30,
            'autocommit': True,
            'isolation_level': 'READ_COMMITTED',
            'max_connections': 100,
            'min_connections': 10,
            'connection_lifetime': 3600,  # 1 hora
            'connection_retry_count': 3,
            'connection_retry_delay': 1,
        },
        'CONN_MAX_AGE': 3600,  # 1 hora
        'CONN_HEALTH_CHECKS': True,
        'ATOMIC_REQUESTS': False,  # Deshabilitar para mejor rendimiento
        'AUTOCOMMIT': True,
    }
}

# Configuración de pool de conexiones
DATABASE_POOL_CONFIG = {
    'max_connections': 100,
    'min_connections': 10,
    'connection_lifetime': 3600,
    'connection_retry_count': 3,
    'connection_retry_delay': 1,
    'connection_timeout': 30,
    'command_timeout': 30,
}

# Configuración de índices recomendados
RECOMMENDED_INDEXES = [
    # Índices para usuarios
    "CREATE INDEX IX_users_email ON users_user(email)",
    "CREATE INDEX IX_users_username ON users_user(username)",
    "CREATE INDEX IX_users_is_active ON users_user(is_active)",
    "CREATE INDEX IX_users_date_joined ON users_user(date_joined)",
    
    # Índices para estudiantes
    "CREATE INDEX IX_students_user_id ON students_student(user_id)",
    "CREATE INDEX IX_students_student_id ON students_student(student_id)",
    "CREATE INDEX IX_students_area_id ON students_student(area_id)",
    "CREATE INDEX IX_students_is_active ON students_student(is_active)",
    
    # Índices para empresas
    "CREATE INDEX IX_companies_user_id ON companies_company(user_id)",
    "CREATE INDEX IX_companies_name ON companies_company(name)",
    "CREATE INDEX IX_companies_is_active ON companies_company(is_active)",
    "CREATE INDEX IX_companies_created_at ON companies_company(created_at)",
    
    # Índices para proyectos
    "CREATE INDEX IX_projects_title ON projects_project(title)",
    "CREATE INDEX IX_projects_status ON projects_project(status)",
    "CREATE INDEX IX_projects_company_id ON projects_project(company_id)",
    "CREATE INDEX IX_projects_created_at ON projects_project(created_at)",
    "CREATE INDEX IX_projects_updated_at ON projects_project(updated_at)",
    
    # Índices para aplicaciones
    "CREATE INDEX IX_applications_student_id ON applications_application(student_id)",
    "CREATE INDEX IX_applications_project_id ON applications_application(project_id)",
    "CREATE INDEX IX_applications_status ON applications_application(status)",
    "CREATE INDEX IX_applications_created_at ON applications_application(created_at)",
    
    # Índices para evaluaciones
    "CREATE INDEX IX_evaluations_student_id ON evaluations_evaluation(student_id)",
    "CREATE INDEX IX_evaluations_project_id ON evaluations_evaluation(project_id)",
    "CREATE INDEX IX_evaluations_evaluator_id ON evaluations_evaluation(evaluator_id)",
    "CREATE INDEX IX_evaluations_created_at ON evaluations_evaluation(created_at)",
    
    # Índices para notificaciones
    "CREATE INDEX IX_notifications_user_id ON notifications_notification(user_id)",
    "CREATE INDEX IX_notifications_is_read ON notifications_notification(is_read)",
    "CREATE INDEX IX_notifications_created_at ON notifications_notification(created_at)",
    
    # Índices para horas de trabajo
    "CREATE INDEX IX_work_hours_student_id ON work_hours_workhour(student_id)",
    "CREATE INDEX IX_work_hours_project_id ON work_hours_workhour(project_id)",
    "CREATE INDEX IX_work_hours_date ON work_hours_workhour(date)",
    "CREATE INDEX IX_work_hours_created_at ON work_hours_workhour(created_at)",
]

# Configuración de consultas optimizadas
OPTIMIZED_QUERIES = {
    # Consulta optimizada para dashboard de estudiante
    'student_dashboard': """
        SELECT 
            s.id, s.student_id, s.first_name, s.last_name, s.email,
            COUNT(DISTINCT a.id) as total_applications,
            COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as accepted_applications,
            COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_applications,
            COUNT(DISTINCT w.id) as total_work_hours,
            SUM(w.hours_worked) as total_hours_worked
        FROM students_student s
        LEFT JOIN applications_application a ON s.user_id = a.student_id
        LEFT JOIN work_hours_workhour w ON s.user_id = w.student_id
        WHERE s.user_id = %s
        GROUP BY s.id, s.student_id, s.first_name, s.last_name, s.email
    """,
    
    # Consulta optimizada para dashboard de empresa
    'company_dashboard': """
        SELECT 
            c.id, c.name, c.description, c.website,
            COUNT(DISTINCT p.id) as total_projects,
            COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
            COUNT(DISTINCT a.id) as total_applications,
            COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as accepted_applications
        FROM companies_company c
        LEFT JOIN projects_project p ON c.user_id = p.company_id
        LEFT JOIN applications_application a ON p.id = a.project_id
        WHERE c.user_id = %s
        GROUP BY c.id, c.name, c.description, c.website
    """,
    
    # Consulta optimizada para listado de proyectos
    'projects_list': """
        SELECT 
            p.id, p.title, p.description, p.status, p.created_at,
            c.name as company_name,
            COUNT(DISTINCT a.id) as applications_count
        FROM projects_project p
        INNER JOIN companies_company c ON p.company_id = c.user_id
        LEFT JOIN applications_application a ON p.id = a.project_id
        WHERE p.status = 'active'
        GROUP BY p.id, p.title, p.description, p.status, p.created_at, c.name
        ORDER BY p.created_at DESC
    """,
}

# Configuración de cache de consultas
QUERY_CACHE_CONFIG = {
    'student_dashboard': 300,  # 5 minutos
    'company_dashboard': 300,  # 5 minutos
    'projects_list': 600,      # 10 minutos
    'user_profile': 1800,      # 30 minutos
    'project_details': 900,    # 15 minutos
}

# Configuración de particionamiento (para tablas grandes)
PARTITIONING_CONFIG = {
    'work_hours_workhour': {
        'partition_by': 'date',
        'partition_type': 'RANGE',
        'partitions': [
            ('2024-01-01', '2024-04-01'),
            ('2024-04-01', '2024-07-01'),
            ('2024-07-01', '2024-10-01'),
            ('2024-10-01', '2025-01-01'),
        ]
    },
    'notifications_notification': {
        'partition_by': 'created_at',
        'partition_type': 'RANGE',
        'partitions': [
            ('2024-01-01', '2024-04-01'),
            ('2024-04-01', '2024-07-01'),
            ('2024-07-01', '2024-10-01'),
            ('2024-10-01', '2025-01-01'),
        ]
    }
}

# Configuración de mantenimiento de base de datos
MAINTENANCE_CONFIG = {
    'auto_vacuum': True,
    'vacuum_threshold': 50,  # Porcentaje de páginas muertas
    'analyze_threshold': 100,  # Número de cambios para re-analizar
    'reindex_frequency': 'weekly',
    'backup_frequency': 'daily',
    'backup_retention': 30,  # días
}

# Configuración de monitoreo de base de datos
DB_MONITORING_CONFIG = {
    'slow_query_threshold': 1.0,  # segundos
    'connection_pool_monitoring': True,
    'query_performance_monitoring': True,
    'deadlock_monitoring': True,
    'index_usage_monitoring': True,
}

# Scripts de mantenimiento
MAINTENANCE_SCRIPTS = {
    'update_statistics': """
        UPDATE STATISTICS users_user;
        UPDATE STATISTICS students_student;
        UPDATE STATISTICS companies_company;
        UPDATE STATISTICS projects_project;
        UPDATE STATISTICS applications_application;
        UPDATE STATISTICS evaluations_evaluation;
        UPDATE STATISTICS notifications_notification;
        UPDATE STATISTICS work_hours_workhour;
    """,
    
    'reindex_tables': """
        ALTER INDEX ALL ON users_user REBUILD;
        ALTER INDEX ALL ON students_student REBUILD;
        ALTER INDEX ALL ON companies_company REBUILD;
        ALTER INDEX ALL ON projects_project REBUILD;
        ALTER INDEX ALL ON applications_application REBUILD;
        ALTER INDEX ALL ON evaluations_evaluation REBUILD;
        ALTER INDEX ALL ON notifications_notification REBUILD;
        ALTER INDEX ALL ON work_hours_workhour REBUILD;
    """,
    
    'cleanup_old_data': """
        -- Limpiar notificaciones antiguas (más de 1 año)
        DELETE FROM notifications_notification 
        WHERE created_at < DATEADD(year, -1, GETDATE());
        
        -- Limpiar logs antiguos (más de 6 meses)
        DELETE FROM activity_logs_activitylog 
        WHERE created_at < DATEADD(month, -6, GETDATE());
    """
} 