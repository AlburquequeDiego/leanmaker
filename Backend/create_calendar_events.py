#!/usr/bin/env python
"""
Script para crear eventos de calendario de prueba para estudiantes.
"""

import os
import sys
import django
from datetime import datetime, timedelta
import uuid

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from calendar_events.models import CalendarEvent
from users.models import User
from projects.models import Proyecto
from django.utils import timezone

def create_test_calendar_events():
    """Crear eventos de calendario de prueba para el estudiante juan.perez@uchile.cl"""
    
    try:
        # Buscar el estudiante
        student = User.objects.get(email='juan.perez@uchile.cl')
        print(f"Estudiante encontrado: {student.email}")
        
        # Buscar un proyecto para asociar algunos eventos
        try:
            project = Proyecto.objects.first()
            print(f"Proyecto encontrado: {project.title if project else 'Sin proyecto'}")
        except:
            project = None
            print("No se encontraron proyectos")
        
        # Crear eventos de prueba
        events_data = [
            {
                'title': 'Reunión de seguimiento del proyecto',
                'description': 'Reunión semanal para revisar el progreso del proyecto y definir próximos pasos',
                'event_type': 'meeting',
                'start_date': timezone.now() + timedelta(days=1, hours=10),
                'end_date': timezone.now() + timedelta(days=1, hours=11),
                'location': 'Sala de reuniones 3',
                'priority': 'high',
                'status': 'scheduled',
                'is_public': True,
                'color': '#1976d2',
            },
            {
                'title': 'Deadline: Entrega del primer prototipo',
                'description': 'Fecha límite para entregar el primer prototipo funcional del proyecto',
                'event_type': 'deadline',
                'start_date': timezone.now() + timedelta(days=3, hours=23, minutes=59),
                'end_date': timezone.now() + timedelta(days=4, hours=0, minutes=1),
                'location': 'Plataforma online',
                'priority': 'urgent',
                'status': 'scheduled',
                'is_public': True,
                'color': '#d32f2f',
            },
            {
                'title': 'Entrevista con la empresa',
                'description': 'Entrevista técnica con el equipo de desarrollo de la empresa',
                'event_type': 'interview',
                'start_date': timezone.now() + timedelta(days=5, hours=14),
                'end_date': timezone.now() + timedelta(days=5, hours=15),
                'location': 'Oficina principal',
                'priority': 'high',
                'status': 'scheduled',
                'is_public': False,
                'color': '#388e3c',
            },
            {
                'title': 'Presentación del proyecto final',
                'description': 'Presentación final del proyecto ante el comité evaluador',
                'event_type': 'presentation',
                'start_date': timezone.now() + timedelta(days=10, hours=15),
                'end_date': timezone.now() + timedelta(days=10, hours=16, minutes=30),
                'location': 'Auditorio principal',
                'priority': 'high',
                'status': 'scheduled',
                'is_public': True,
                'color': '#f57c00',
            },
            {
                'title': 'Revisión de código',
                'description': 'Sesión de revisión de código con el mentor del proyecto',
                'event_type': 'review',
                'start_date': timezone.now() + timedelta(days=2, hours=16),
                'end_date': timezone.now() + timedelta(days=2, hours=17),
                'location': 'Sala de desarrollo',
                'priority': 'medium',
                'status': 'scheduled',
                'is_public': False,
                'color': '#7b1fa2',
            },
            {
                'title': 'Workshop: Metodologías ágiles',
                'description': 'Taller sobre implementación de metodologías ágiles en proyectos de desarrollo',
                'event_type': 'meeting',
                'start_date': timezone.now() + timedelta(days=7, hours=9),
                'end_date': timezone.now() + timedelta(days=7, hours=12),
                'location': 'Sala de capacitación',
                'priority': 'medium',
                'status': 'scheduled',
                'is_public': True,
                'color': '#0288d1',
            },
            {
                'title': 'Reunión de equipo',
                'description': 'Reunión diaria del equipo para sincronización y planificación',
                'event_type': 'meeting',
                'start_date': timezone.now() + timedelta(hours=2),
                'end_date': timezone.now() + timedelta(hours=2, minutes=30),
                'location': 'Sala de reuniones 1',
                'priority': 'low',
                'status': 'scheduled',
                'is_public': False,
                'color': '#1976d2',
            },
        ]
        
        created_events = []
        for event_data in events_data:
            # Verificar si el evento ya existe
            existing_event = CalendarEvent.objects.filter(
                title=event_data['title'],
                start_date=event_data['start_date'],
                created_by=student
            ).first()
            
            if existing_event:
                print(f"Evento ya existe: {event_data['title']}")
                continue
            
            # Crear el evento
            event = CalendarEvent.objects.create(
                title=event_data['title'],
                description=event_data['description'],
                event_type=event_data['event_type'],
                start_date=event_data['start_date'],
                end_date=event_data['end_date'],
                location=event_data['location'],
                priority=event_data['priority'],
                status=event_data['status'],
                is_public=event_data['is_public'],
                color=event_data['color'],
                created_by=student,
                project=project,
            )
            
            # Agregar al estudiante como participante
            event.attendees.add(student)
            
            created_events.append(event)
            print(f"Evento creado: {event.title} - {event.start_date}")
        
        print(f"\n✅ Se crearon {len(created_events)} eventos de calendario de prueba")
        
        # Mostrar resumen
        total_events = CalendarEvent.objects.filter(created_by=student).count()
        print(f"Total de eventos para {student.email}: {total_events}")
        
    except User.DoesNotExist:
        print("❌ Error: No se encontró el usuario juan.perez@uchile.cl")
        print("Asegúrate de que el usuario existe antes de ejecutar este script")
    except Exception as e:
        print(f"❌ Error al crear eventos: {str(e)}")

if __name__ == '__main__':
    print("🚀 Creando eventos de calendario de prueba...")
    create_test_calendar_events()
    print("✅ Script completado") 