#!/usr/bin/env python
"""
Script para poblar la base de datos con eventos de calendario de prueba.
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
from companies.models import Empresa

def create_test_calendar_events():
    """Crear eventos de calendario de prueba"""
    
    print("🎯 Creando eventos de calendario de prueba...")
    
    # Obtener usuarios existentes
    try:
        company_user = User.objects.filter(role='company').first()
        student_users = User.objects.filter(role='student')[:5]  # Primeros 5 estudiantes
        
        if not company_user:
            print("❌ No se encontró usuario de empresa")
            return
        
        if not student_users:
            print("❌ No se encontraron estudiantes")
            return
            
    except Exception as e:
        print(f"❌ Error obteniendo usuarios: {e}")
        return
    
    # Crear eventos de prueba
    events_data = [
        {
            'title': 'Reunión de Kickoff - Proyecto IA',
            'description': 'Reunión inicial para discutir los objetivos del proyecto de Inteligencia Artificial',
            'event_type': 'meeting',
            'start_date': datetime.now() + timedelta(days=1, hours=10),
            'end_date': datetime.now() + timedelta(days=1, hours=11),
            'location': 'Sala de Conferencias Virtual',
            'priority': 'high',
            'is_online': True,
            'meeting_url': 'https://meet.google.com/abc-defg-hij',
            'is_public': True,
        },
        {
            'title': 'Entrevista Técnica - Juan Pérez',
            'description': 'Entrevista técnica para evaluar habilidades de programación',
            'event_type': 'interview',
            'start_date': datetime.now() + timedelta(days=2, hours=14),
            'end_date': datetime.now() + timedelta(days=2, hours=15),
            'location': 'Oficina Principal',
            'priority': 'medium',
            'is_online': False,
            'is_public': False,
        },
        {
            'title': 'Fecha Límite - Entrega Prototipo',
            'description': 'Fecha límite para la entrega del prototipo del proyecto',
            'event_type': 'deadline',
            'start_date': datetime.now() + timedelta(days=5, hours=17),
            'end_date': datetime.now() + timedelta(days=5, hours=17),
            'location': 'Sistema de Gestión',
            'priority': 'urgent',
            'is_online': True,
            'is_public': True,
        },
        {
            'title': 'Recordatorio - Revisión de Código',
            'description': 'Recordatorio para revisar el código del sprint actual',
            'event_type': 'reminder',
            'start_date': datetime.now() + timedelta(days=3, hours=9),
            'end_date': datetime.now() + timedelta(days=3, hours=9, minutes=30),
            'location': 'Plataforma de Desarrollo',
            'priority': 'medium',
            'is_online': True,
            'is_public': True,
        },
        {
            'title': 'Workshop - React Avanzado',
            'description': 'Taller sobre técnicas avanzadas de React para el equipo',
            'event_type': 'meeting',
            'start_date': datetime.now() + timedelta(days=7, hours=15),
            'end_date': datetime.now() + timedelta(days=7, hours=17),
            'location': 'Sala de Capacitación',
            'priority': 'low',
            'is_online': False,
            'is_public': True,
        }
    ]
    
    created_events = []
    
    for i, event_data in enumerate(events_data):
        try:
            # Crear evento
            event = CalendarEvent.objects.create(
                title=event_data['title'],
                description=event_data['description'],
                event_type=event_data['event_type'],
                start_date=event_data['start_date'],
                end_date=event_data['end_date'],
                location=event_data['location'],
                priority=event_data['priority'],
                is_online=event_data['is_online'],
                meeting_url=event_data.get('meeting_url'),
                is_public=event_data['is_public'],
                created_by=company_user,
                user=company_user,
                color='#1976d2' if event_data['event_type'] == 'meeting' else 
                     '#d32f2f' if event_data['event_type'] == 'deadline' else
                     '#f57c00' if event_data['event_type'] == 'reminder' else
                     '#1976d2' if event_data['event_type'] == 'interview' else '#388e3c'
            )
            
            # Agregar algunos estudiantes como participantes
            if event_data['event_type'] in ['meeting', 'interview']:
                for student in student_users[:3]:  # Primeros 3 estudiantes
                    event.attendees.add(student)
            
            created_events.append(event)
            print(f"✅ Evento creado: {event.title}")
            
        except Exception as e:
            print(f"❌ Error creando evento {event_data['title']}: {e}")
    
    print(f"\n🎉 Se crearon {len(created_events)} eventos de calendario de prueba")
    print("📅 Los eventos están disponibles en el calendario de la empresa")
    
    return created_events

if __name__ == '__main__':
    create_test_calendar_events() 