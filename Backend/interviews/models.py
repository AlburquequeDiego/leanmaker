from django.db import models
from applications.models import Aplicacion
from users.models import Usuario

class Interview(models.Model):
    id = models.AutoField(primary_key=True)
    application = models.ForeignKey(Aplicacion, on_delete=models.CASCADE, related_name='interviews')
    interviewer = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='interviews_conducted')
    interview_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    interview_type = models.CharField(max_length=20, default='video')
    status = models.CharField(max_length=20, default='scheduled')
    notes = models.TextField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'interviews'
        verbose_name = 'Entrevista'
        verbose_name_plural = 'Entrevistas'
        ordering = ['-interview_date']

    def __str__(self):
        return f"{self.application.student.user.full_name} - {self.interview_date}"
