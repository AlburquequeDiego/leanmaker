# Generated manually for TRL to TRLD migration

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        (
            "collective_challenges",
            "0003_challengearea_teachersection_studentgroup_and_more",
        ),
    ]

    operations = [
        # Renombrar campos de TRL a TRLD en ChallengeProgress
        migrations.RenameField(
            model_name='challengeprogress',
            old_name='trl_1_progress',
            new_name='trld_1_progress',
        ),
        migrations.RenameField(
            model_name='challengeprogress',
            old_name='trl_2_progress',
            new_name='trld_2_progress',
        ),
        migrations.RenameField(
            model_name='challengeprogress',
            old_name='trl_3_progress',
            new_name='trld_3_progress',
        ),
        migrations.RenameField(
            model_name='challengeprogress',
            old_name='trl_4_progress',
            new_name='trld_4_progress',
        ),
        migrations.RenameField(
            model_name='challengeprogress',
            old_name='trl_5_progress',
            new_name='trld_5_progress',
        ),
        migrations.RenameField(
            model_name='challengeprogress',
            old_name='trl_6_progress',
            new_name='trld_6_progress',
        ),
        migrations.RenameField(
            model_name='challengeprogress',
            old_name='trl_7_progress',
            new_name='trld_7_progress',
        ),
        migrations.RenameField(
            model_name='challengeprogress',
            old_name='trl_8_progress',
            new_name='trld_8_progress',
        ),
        migrations.RenameField(
            model_name='challengeprogress',
            old_name='trl_9_progress',
            new_name='trld_9_progress',
        ),
    ]

