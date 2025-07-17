#!/usr/bin/env python
"""
Script para probar la configuración de email SOLO ASCII.
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email_configuration():
    print("=== Configuración de Email ===")
    print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'No configurado'}")
    
    print("\n=== Probando envío de correo SOLO ASCII ===")
    try:
        # Mensaje y asunto SOLO ASCII
        asunto = 'Prueba correo LeanMaker'
        mensaje = 'Este es un correo de prueba. Solo texto plano, sin acentos ni eñes.'
        send_mail(
            asunto,
            mensaje,
            settings.EMAIL_HOST_USER,
            ['test@example.com'],  # Cambia por tu correo real para la prueba
            fail_silently=False,
        )
        print("✅ Correo enviado exitosamente!")
        print("Si usaste tu correo real, deberías recibirlo.")
    except Exception as e:
        print(f"❌ Error al enviar correo: {str(e)}")
        print("\nPosibles soluciones:")
        print("1. Verifica que las credenciales en .env sean correctas")
        print("2. Asegúrate de que la cuenta tenga permisos para enviar correos")
        print("3. Si usas Gmail/Outlook, verifica que tengas habilitada la verificación en dos pasos y uses una contraseña de aplicación")

if __name__ == '__main__':
    test_email_configuration() 