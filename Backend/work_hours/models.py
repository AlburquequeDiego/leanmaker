from django.db import models
from applications.models import Asignacion
from students.models import Estudiante
from projects.models import Proyecto
from companies.models import Empresa
from users.models import Usuario

class WorkHour(models.Model):
    id = models.AutoField(primary_key=True)
    assignment = models.ForeignKey(Asignacion, on_delete=models.CASCADE, related_name='work_hours')
    student = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='work_hours')
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='work_hours')
    company = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='work_hours')
    fecha = models.DateField()
    horas_trabajadas = models.IntegerField()
    descripcion = models.TextField(null=True, blank=True)
    estado_validacion = models.CharField(max_length=20, default='pendiente')
    validador = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='horas_validadas')
    fecha_validacion = models.DateTimeField(null=True, blank=True)
    comentario_validacion = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'work_hours'
        verbose_name = 'Hora Trabajada'
        verbose_name_plural = 'Horas Trabajadas'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.student.user.full_name} - {self.fecha} ({self.horas_trabajadas}h)"
