from django.contrib import admin
from .models import Estudiante

@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    list_display = ('user', 'career', 'semester', 'status')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'career')
    list_filter = ('career', 'semester', 'status')
    ordering = ('user__last_name', 'user__first_name')

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

    def full_name(self, obj):
        return f"{self.user.first_name} {self.user.last_name}"
    full_name.short_description = 'Nombre Completo'
