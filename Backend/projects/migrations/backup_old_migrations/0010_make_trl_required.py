# Generated manually to make TRL field required

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('trl_levels', '0001_initial'),
        ('projects', '0009_remove_difficulty_field'),
    ]

    operations = [
        # Primero asignamos TRL por defecto a proyectos existentes
        migrations.RunSQL(
            sql="""
            UPDATE projects 
            SET trl_id = (
                SELECT id FROM trl_levels 
                WHERE level = 1 
                LIMIT 1
            )
            WHERE trl_id IS NULL;
            """,
            reverse_sql="""
            -- No hay reversión para esta operación
            """
        ),
        
        # Luego hacemos el campo obligatorio
        migrations.AlterField(
            model_name='proyecto',
            name='trl',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='proyectos',
                to='trl_levels.trllevel',
                null=False,
                blank=False,
                help_text='Nivel TRL obligatorio para el proyecto'
            ),
        ),
    ]
