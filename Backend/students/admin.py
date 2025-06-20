from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'university', 'major', 'user_email')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'university', 'major')
    list_filter = ('university', 'major', 'semester')
    ordering = ('user__last_name', 'user__first_name')

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

    def full_name(self, obj):
        return f"{self.user.first_name} {self.user.last_name}"
    full_name.short_description = 'Nombre Completo'
