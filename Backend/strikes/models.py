from projects.models import Proyecto
from users.models import Usuario
from companies.models import Empresa
from django.db import models
from students.models import Estudiante
import uuid

class Strike(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='strike_records', verbose_name='Estudiante')
    company = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='issued_strikes', verbose_name='Empresa Emisora')
    reason = models.TextField(verbose_name='Motivo de la Amonestación')
    severity = models.CharField(max_length=20, default='medium')
    issued_by = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='strikes_issued', null=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'strikes'
        verbose_name = 'Amonestación (Strike)'
        verbose_name_plural = 'Amonestaciones (Strikes)'
        ordering = ['-issued_at']

    def __str__(self):
        return f'Amonestación para {self.student} en {self.company} ({self.severity})'
