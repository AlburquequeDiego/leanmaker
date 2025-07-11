from django.db import models
from django.core.validators import FileExtensionValidator
from users.models import User
from projects.models import Proyecto


class Document(models.Model):
    """
    Modelo para documentos del sistema
    Permite almacenar y gestionar documentos relacionados con proyectos y usuarios
    """
    DOCUMENT_TYPE_CHOICES = [
        ('contract', 'Contrato'),
        ('proposal', 'Propuesta'),
        ('report', 'Reporte'),
        ('presentation', 'Presentación'),
        ('manual', 'Manual'),
        ('certificate', 'Certificado'),
        ('other', 'Otro'),
    ]

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPE_CHOICES,
        default='other',
        help_text="Tipo de documento"
    )
    file = models.FileField(
        upload_to='documents/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png'])],
        help_text="Archivo del documento"
    )
    file_url = models.CharField(max_length=500)
    file_type = models.CharField(max_length=50, null=True, blank=True)
    file_size = models.IntegerField(null=True, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents_uploaded')
    project = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='documents')
    is_public = models.BooleanField(default=False)
    download_count = models.IntegerField(
        default=0,
        help_text="Número de descargas del documento"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'documents'
        verbose_name = 'Documento'
        verbose_name_plural = 'Documentos'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def file_size_mb(self):
        """Retorna el tamaño del archivo en MB"""
        if self.file:
            return round(self.file.size / (1024 * 1024), 2)
        return 0

    @property
    def file_extension(self):
        """Retorna la extensión del archivo"""
        if self.file:
            return self.file.name.split('.')[-1].upper()
        return None

    def increment_download_count(self):
        """Incrementa el contador de descargas"""
        self.download_count += 1
        self.save(update_fields=['download_count'])
