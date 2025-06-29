from django.db import models
from django.conf import settings
from projects.models import Proyecto
from students.models import Student
from users.models import Usuario
import uuid

class Aplicacion(models.Model):
    class Estados(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        EN_REVISION = 'EN_REVISION', 'En Revisión'
        ENTREVISTA_PROGRAMADA = 'ENTREVISTA_PROGRAMADA', 'Entrevista Programada'
        ACEPTADA = 'ACEPTADA', 'Aceptada'
        RECHAZADA = 'RECHAZADA', 'Rechazada'
        RETIRADA = 'RETIRADA', 'Retirada'

    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='aplicaciones_estudiante', verbose_name='Proyecto')
    estudiante = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='aplicaciones_estudiante', verbose_name='Estudiante')
    
    fecha_aplicacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Postulación')
    estado = models.CharField(max_length=25, choices=Estados.choices, default=Estados.PENDIENTE, verbose_name='Estado')
    
    carta_presentacion = models.TextField(blank=True, verbose_name='Carta de Presentación')

    class Meta:
        db_table = 'aplicaciones'
        verbose_name = 'Postulación'
        verbose_name_plural = 'Postulaciones'
        # Un estudiante solo puede postular una vez a un mismo proyecto
        unique_together = ('proyecto', 'estudiante')
        ordering = ['-fecha_aplicacion']

    def __str__(self):
        return f'Postulación de {self.estudiante} a {self.proyecto.titulo}'
