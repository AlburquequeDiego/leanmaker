from django.db import models
from users.models import Usuario
import uuid

class Empresa(models.Model):
    TAMANOS = (
        ('startup', 'Startup'),
        ('pequena', 'Pequeña (1-50)'),
        ('mediana', 'Mediana (51-200)'),
        ('grande', 'Grande (201-1000)'),
        ('corporacion', 'Corporación (1000+)'),
    )
    
    INDUSTRIAS = (
        ('tecnologia', 'Tecnología'),
        ('finanzas', 'Finanzas'),
        ('salud', 'Salud'),
        ('educacion', 'Educación'),
        ('retail', 'Retail'),
        ('manufactura', 'Manufactura'),
        ('consultoria', 'Consultoría'),
        ('marketing', 'Marketing'),
        ('diseno', 'Diseño'),
        ('otros', 'Otros'),
    )
    
    # Campos básicos
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_empresa')
    
    # Información de la empresa
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    sitio_web = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to='logos_empresas/', blank=True, null=True)
    
    # Detalles de la empresa
    tamaño = models.CharField(max_length=20, choices=TAMANOS, default='mediana')
    industria = models.CharField(max_length=20, choices=INDUSTRIAS, default='tecnologia')
    ubicacion = models.CharField(max_length=200)
    año_fundacion = models.PositiveIntegerField(blank=True, null=True)
    
    # Información de contacto
    telefono_contacto = models.CharField(max_length=20, blank=True, null=True)
    email_contacto = models.EmailField(blank=True, null=True)
    persona_contacto = models.CharField(max_length=100, blank=True, null=True)
    
    # Métricas y calificaciones
    calificacion_promedio = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_calificaciones = models.PositiveIntegerField(default=0)
    proyectos_publicados = models.PositiveIntegerField(default=0)
    proyectos_completados = models.PositiveIntegerField(default=0)
    
    # Estado y verificación
    esta_verificada = models.BooleanField(default=False)
    fecha_verificacion = models.DateTimeField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    # Información adicional
    redes_sociales = models.JSONField(default=dict)  # LinkedIn, Twitter, etc.
    beneficios = models.JSONField(default=list)  # Lista de beneficios ofrecidos
    tecnologias = models.JSONField(default=list)  # Tecnologías que utilizan
    
    class Meta:
        db_table = 'companies'
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
    
    def __str__(self):
        return self.nombre
    
    @property
    def puede_publicar_proyectos(self):
        """Verifica si la empresa puede publicar proyectos"""
        return self.esta_verificada and self.usuario.esta_activo
    
    def actualizar_calificacion(self, nueva_calificacion):
        """Actualiza la calificación promedio de la empresa"""
        total_actual = self.calificacion_promedio * self.total_calificaciones
        self.total_calificaciones += 1
        self.calificacion_promedio = (total_actual + nueva_calificacion) / self.total_calificaciones
        self.save(update_fields=['calificacion_promedio', 'total_calificaciones'])
    
    def incrementar_proyectos_publicados(self):
        """Incrementa el contador de proyectos publicados"""
        self.proyectos_publicados += 1
        self.save(update_fields=['proyectos_publicados'])
    
    def incrementar_proyectos_completados(self):
        """Incrementa el contador de proyectos completados"""
        self.proyectos_completados += 1
        self.save(update_fields=['proyectos_completados'])

class CalificacionEmpresa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='calificaciones')
    estudiante = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='calificaciones_dadas')
    
    # Calificación
    puntuacion = models.PositiveIntegerField()  # 1-5 estrellas
    comentario = models.TextField(blank=True, null=True)
    
    # Criterios específicos
    comunicacion = models.PositiveIntegerField(blank=True, null=True)
    flexibilidad = models.PositiveIntegerField(blank=True, null=True)
    aprendizaje = models.PositiveIntegerField(blank=True, null=True)
    ambiente_trabajo = models.PositiveIntegerField(blank=True, null=True)
    
    # Fechas
    fecha_calificacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'company_ratings'
        verbose_name = 'Calificación de Empresa'
        verbose_name_plural = 'Calificaciones de Empresas'
        unique_together = ['empresa', 'estudiante']
    
    def __str__(self):
        return f"{self.estudiante.get_full_name()} -> {self.empresa.nombre} ({self.puntuacion}/5)"
    
    def save(self, *args, **kwargs):
        # Actualizar calificación promedio de la empresa
        super().save(*args, **kwargs)
        self.empresa.actualizar_calificacion(self.puntuacion)
