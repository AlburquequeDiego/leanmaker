# Generated manually to fix hours_worked field

from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('work_hours', '0004_recreate_work_hours_table'),
    ]

    operations = [
        migrations.RunSQL(
            # SQL para recrear la tabla con el campo corregido (SQLite)
            """
            DROP TABLE IF EXISTS work_hours;
            CREATE TABLE work_hours (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id CHAR(32) NOT NULL,
                project_id CHAR(32) NOT NULL,
                date DATE NOT NULL,
                hours_worked DECIMAL(6,2) NOT NULL,
                description TEXT,
                is_verified BOOLEAN NOT NULL DEFAULT 0,
                verified_by_id VARCHAR(36),
                verified_at DATETIME,
                is_project_completion BOOLEAN NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL,
                FOREIGN KEY (student_id) REFERENCES students (id),
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (verified_by_id) REFERENCES users (id)
            );
            """,
            # SQL para revertir (recrear con el campo original)
            """
            DROP TABLE IF EXISTS work_hours;
            CREATE TABLE work_hours (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id CHAR(32) NOT NULL,
                project_id CHAR(32) NOT NULL,
                date DATE NOT NULL,
                hours_worked DECIMAL(4,2) NOT NULL,
                description TEXT,
                is_verified BOOLEAN NOT NULL DEFAULT 0,
                verified_by_id VARCHAR(36),
                verified_at DATETIME,
                is_project_completion BOOLEAN NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL,
                FOREIGN KEY (student_id) REFERENCES students (id),
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (verified_by_id) REFERENCES users (id)
            );
            """,
        ),
    ] 