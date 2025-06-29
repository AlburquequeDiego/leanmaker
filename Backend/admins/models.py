from django.db import models
from users.models import Usuario

class Admin(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(Usuario, on_delete=models.CASCADE, unique=True, related_name='admin_profile')
    permissions = models.TextField(null=True, blank=True)  # JSON array de permisos
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admins'
        verbose_name = 'Administrador'
        verbose_name_plural = 'Administradores'

    def __str__(self):
        return f"Admin: {self.user.email}" 