"""
Serializers para la app mass_notifications.
"""

import json
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from .models import MassNotification, NotificationTemplate
from users.models import User

class NotificationTemplateSerializer:
    """Serializer para el modelo NotificationTemplate"""
    
    @staticmethod
    def to_dict(template):
        """Convierte un objeto NotificationTemplate a diccionario"""
        return {
            'id': str(template.id),
            'name': template.name,
            'notification_type': template.notification_type,
            'title_template': template.title_template,
            'message_template': template.message_template,
            'is_active': template.is_active,
            'created_by_id': str(template.created_by.id) if template.created_by else None,
            'created_by_name': template.created_by.full_name if template.created_by else None,
            'created_at': template.created_at.isoformat(),
            'updated_at': template.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la plantilla"""
        errors = {}
        
        # Validar campos requeridos
        if 'name' not in data or not data['name']:
            errors['name'] = 'El nombre es requerido'
        elif len(data['name'].strip()) < 3:
            errors['name'] = 'El nombre debe tener al menos 3 caracteres'
        else:
            data['name'] = data['name'].strip()
        
        if 'title_template' not in data or not data['title_template']:
            errors['title_template'] = 'La plantilla del título es requerida'
        elif len(data['title_template'].strip()) < 5:
            errors['title_template'] = 'La plantilla del título debe tener al menos 5 caracteres'
        else:
            data['title_template'] = data['title_template'].strip()
        
        if 'message_template' not in data or not data['message_template']:
            errors['message_template'] = 'La plantilla del mensaje es requerida'
        elif len(data['message_template'].strip()) < 10:
            errors['message_template'] = 'La plantilla del mensaje debe tener al menos 10 caracteres'
        else:
            data['message_template'] = data['message_template'].strip()
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea una nueva plantilla"""
        with transaction.atomic():
            template = NotificationTemplate.objects.create(
                name=data['name'],
                notification_type=data.get('notification_type', 'general'),
                title_template=data['title_template'],
                message_template=data['message_template'],
                is_active=data.get('is_active', True),
                created_by=user
            )
            
            return template
    
    @staticmethod
    def update(template, data):
        """Actualiza una plantilla existente"""
        with transaction.atomic():
            # Actualizar campos
            if 'name' in data:
                template.name = data['name']
            if 'notification_type' in data:
                template.notification_type = data['notification_type']
            if 'title_template' in data:
                template.title_template = data['title_template']
            if 'message_template' in data:
                template.message_template = data['message_template']
            if 'is_active' in data:
                template.is_active = data['is_active']
            
            template.save()
            return template

class MassNotificationSerializer:
    """Serializer para el modelo MassNotification"""
    
    @staticmethod
    def to_dict(notification):
        """Convierte un objeto MassNotification a diccionario"""
        return {
            'id': str(notification.id),
            'title': notification.title,
            'message': notification.message,
            'notification_type': notification.notification_type,
            'priority': notification.priority,
            'status': notification.status,
            'target_students': [
                {
                    'id': str(student.id),
                    'name': student.full_name
                }
                for student in notification.target_students.all()
            ],
            'target_companies': [
                {
                    'id': str(company.id),
                    'name': company.name
                }
                for company in notification.target_companies.all()
            ],
            'target_all_students': notification.target_all_students,
            'target_all_companies': notification.target_all_companies,
            'scheduled_at': notification.scheduled_at.isoformat() if notification.scheduled_at else None,
            'sent_at': notification.sent_at.isoformat() if notification.sent_at else None,
            'total_recipients': notification.total_recipients,
            'sent_count': notification.sent_count,
            'failed_count': notification.failed_count,
            'read_count': notification.read_count,
            'created_by_id': str(notification.created_by.id) if notification.created_by else None,
            'created_by_name': notification.created_by.full_name if notification.created_by else None,
            'created_at': notification.created_at.isoformat(),
            'updated_at': notification.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la notificación masiva"""
        errors = {}
        
        # Validar campos requeridos
        if 'title' not in data or not data['title']:
            errors['title'] = 'El título es requerido'
        elif len(data['title'].strip()) < 5:
            errors['title'] = 'El título debe tener al menos 5 caracteres'
        else:
            data['title'] = data['title'].strip()
        
        if 'message' not in data or not data['message']:
            errors['message'] = 'El mensaje es requerido'
        elif len(data['message'].strip()) < 10:
            errors['message'] = 'El mensaje debe tener al menos 10 caracteres'
        else:
            data['message'] = data['message'].strip()
        
        # Validar scheduled_at (opcional ahora)
        if 'scheduled_at' in data and data['scheduled_at']:
            try:
                scheduled_at = timezone.datetime.fromisoformat(data['scheduled_at'].replace('Z', '+00:00'))
                if scheduled_at <= timezone.now():
                    errors['scheduled_at'] = 'La fecha programada debe ser futura'
                data['scheduled_at'] = scheduled_at
            except (ValueError, TypeError):
                errors['scheduled_at'] = 'Formato de fecha inválido'
        else:
            # Si no hay fecha programada, establecer como None
            data['scheduled_at'] = None
        
        # Validar que se especifique al menos un destinatario
        target_student_ids = data.get('target_student_ids', [])
        target_company_ids = data.get('target_company_ids', [])
        target_all_students = data.get('target_all_students', False)
        target_all_companies = data.get('target_all_companies', False)
        
        if not any([target_student_ids, target_company_ids, target_all_students, target_all_companies]):
            errors['recipients'] = 'Debe especificar al menos un destinatario (todos los estudiantes, todas las empresas, o seleccionar específicos)'
        
        # Si está programada, debe tener fecha programada
        if data.get('status') == 'scheduled' and not data.get('scheduled_at'):
            errors['scheduled_at'] = 'Las notificaciones programadas deben tener una fecha programada'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea una nueva notificación masiva"""
        with transaction.atomic():
            # Extraer IDs de destinatarios
            target_student_ids = data.pop('target_student_ids', [])
            target_company_ids = data.pop('target_company_ids', [])
            
            # Crear notificación
            notification = MassNotification.objects.create(
                title=data['title'],
                message=data['message'],
                notification_type=data.get('notification_type', 'announcement'),
                priority=data.get('priority', 'normal'),
                status=data.get('status', 'draft'),
                target_all_students=data.get('target_all_students', False),
                target_all_companies=data.get('target_all_companies', False),
                scheduled_at=data.get('scheduled_at', None),
                created_by=user
            )
            
            # Asignar destinatarios específicos
            if target_student_ids:
                from students.models import Estudiante
                students = Estudiante.objects.filter(id__in=target_student_ids)
                notification.target_students.set(students)
            
            if target_company_ids:
                from companies.models import Empresa
                companies = Empresa.objects.filter(id__in=target_company_ids)
                notification.target_companies.set(companies)
            
            # Calcular total de destinatarios
            notification.calculate_recipients()
            
            return notification
    
    @staticmethod
    def update(notification, data):
        """Actualiza una notificación masiva existente"""
        with transaction.atomic():
            # Extraer IDs de destinatarios
            target_student_ids = data.pop('target_student_ids', None)
            target_company_ids = data.pop('target_company_ids', None)
            
            # Actualizar campos básicos
            basic_fields = [
                'title', 'message', 'notification_type', 'priority', 'status',
                'target_all_students', 'target_all_companies', 'scheduled_at'
            ]
            
            for field in basic_fields:
                if field in data:
                    setattr(notification, field, data[field])
            
            notification.save()
            
            # Actualizar destinatarios específicos si se proporcionan
            if target_student_ids is not None:
                from students.models import Estudiante
                students = Estudiante.objects.filter(id__in=target_student_ids)
                notification.target_students.set(students)
            
            if target_company_ids is not None:
                from companies.models import Empresa
                companies = Empresa.objects.filter(id__in=target_company_ids)
                notification.target_companies.set(companies)
            
            # Recalcular total de destinatarios
            notification.calculate_recipients()
            
            return notification 