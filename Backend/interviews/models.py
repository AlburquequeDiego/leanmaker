from django.db import models
from users.models import Usuario
import uuid

class Interview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Temporalmente usar CharField en lugar de ForeignKey para evitar dependencias
    application_id = models.CharField(max_length=36, null=True, blank=True)  # UUID como string
    interviewer = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='interviews_conducted')
    interview_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    interview_type = models.CharField(max_length=20, default='video')
    status = models.CharField(max_length=20, default='scheduled')
    notes = models.TextField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    rating = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Entrevista'
        verbose_name_plural = 'Entrevistas'
        db_table = 'interviews'
        ordering = ['-interview_date']

    def __str__(self):
        return f"Entrevista {self.id} - {self.interview_date}"
