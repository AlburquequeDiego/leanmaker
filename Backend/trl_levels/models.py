from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class TRLLevel(models.Model):
    """
    Modelo para los niveles TRL (Technology Readiness Level)
    Define el nivel de madurez tecnológica de los proyectos
    """
    id = models.AutoField(primary_key=True)
    level = models.IntegerField(
        unique=True,
        validators=[MinValueValidator(1), MaxValueValidator(9)],
        help_text="Nivel TRL del 1 al 9"
    )
    name = models.CharField(
        max_length=100,
        help_text="Nombre del nivel TRL"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Descripción detallada del nivel"
    )
    min_hours = models.IntegerField(help_text="Horas mínimas requeridas para este nivel")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trl_levels'
        verbose_name = 'Nivel TRL'
        verbose_name_plural = 'Niveles TRL'
        ordering = ['level']

    def __str__(self):
        return f"TRL {self.level}: {self.name}"

    @property
    def full_name(self):
        return f"TRL {self.level} - {self.name}"
