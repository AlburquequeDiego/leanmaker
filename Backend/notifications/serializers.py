"""
Serializers para la app notifications.
"""

import json
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import Notification, NotificationTemplate, NotificationPreference
from users.models import User

class NotificationSerializer:
    """Serializer para el modelo Notification"""
    
    @staticmethod
    def to_dict(notification):
        """Convierte un objeto Notification a diccionario"""
        return {
            'id': str(notification.id),
            'user_id': str(notification.user.id),
            'user_name': notification.user.full_name,
            'title': notification.title,
            'message': notification.message,
            'type': notification.type,
            'read': notification.read,
            'related_url': notification.related_url,
            'notification_type': notification.notification_type,
            'is_read': notification.is_read,
            'read_at': notification.read_at.isoformat() if notification.read_at else None,
            'created_at': notification.created_at.isoformat(),
            'expires_at': notification.expires_at.isoformat() if notification.expires_at else None,
            'action_url': notification.action_url,
            'priority': notification.priority,
            'updated_at': notification.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de la notificación"""
        errors = {}
        
        # Validar campos requeridos
        if 'title' not in data or not data['title']:
            errors['title'] = 'El título es requerido'
        elif len(data['title'].strip()) < 3:
            errors['title'] = 'El título debe tener al menos 3 caracteres'
        else:
            data['title'] = data['title'].strip()
        
        if 'message' not in data or not data['message']:
            errors['message'] = 'El mensaje es requerido'
        elif len(data['message'].strip()) < 5:
            errors['message'] = 'El mensaje debe tener al menos 5 caracteres'
        else:
            data['message'] = data['message'].strip()
        
        # Validar type
        if 'type' in data:
            valid_types = [choice[0] for choice in Notification.TYPE_CHOICES]
            if data['type'] not in valid_types:
                errors['type'] = 'Tipo de notificación no válido'
        
        # Validar priority
        if 'priority' in data:
            valid_priorities = [choice[0] for choice in Notification.PRIORITY_CHOICES]
            if data['priority'] not in valid_priorities:
                errors['priority'] = 'Prioridad no válida'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea una nueva notificación"""
        with transaction.atomic():
            notification = Notification.objects.create(
                user=user,
                title=data['title'],
                message=data['message'],
                type=data.get('type', 'info'),
                read=data.get('read', False),
                related_url=data.get('related_url', ''),
                notification_type=data.get('notification_type', 'general'),
                action_url=data.get('action_url', ''),
                priority=data.get('priority', 'normal'),
                expires_at=data.get('expires_at')
            )
            
            return notification
    
    @staticmethod
    def update(notification, data):
        """Actualiza una notificación existente"""
        with transaction.atomic():
            # Actualizar campos básicos
            basic_fields = [
                'title', 'message', 'type', 'read', 'related_url',
                'notification_type', 'action_url', 'priority', 'expires_at'
            ]
            
            for field in basic_fields:
                if field in data:
                    setattr(notification, field, data[field])
            
            # Manejar is_read
            if 'read' in data:
                notification.read = data['read']
                if data['read'] and not notification.read_at:
                    from django.utils import timezone
                    notification.read_at = timezone.now()
                elif not data['read']:
                    notification.read_at = None
            
            notification.save()
            return notification

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
            'priority': template.priority,
            'available_variables': template.get_available_variables_list(),
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
        
        # Validar available_variables
        if 'available_variables' in data and data['available_variables']:
            try:
                if isinstance(data['available_variables'], str):
                    json.loads(data['available_variables'])
                elif isinstance(data['available_variables'], list):
                    json.dumps(data['available_variables'])
            except (json.JSONDecodeError, TypeError):
                errors['available_variables'] = 'El campo available_variables debe ser un JSON válido'
        
        return errors
    
    @staticmethod
    def create(data):
        """Crea una nueva plantilla"""
        with transaction.atomic():
            template = NotificationTemplate.objects.create(
                name=data['name'],
                notification_type=data.get('notification_type', 'general'),
                title_template=data['title_template'],
                message_template=data['message_template'],
                is_active=data.get('is_active', True),
                priority=data.get('priority', 'normal'),
                available_variables=data.get('available_variables', '[]')
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
            if 'priority' in data:
                template.priority = data['priority']
            if 'available_variables' in data:
                template.available_variables = data['available_variables']
            
            template.save()
            return template

class NotificationPreferenceSerializer:
    """Serializer para el modelo NotificationPreference"""
    
    @staticmethod
    def to_dict(preference):
        """Convierte un objeto NotificationPreference a diccionario"""
        return {
            'id': str(preference.id),
            'user_id': str(preference.user.id),
            'user_name': preference.user.full_name,
            'enabled_types': preference.get_enabled_types_list(),
            'email_enabled': preference.email_enabled,
            'push_enabled': preference.push_enabled,
            'sms_enabled': preference.sms_enabled,
            'digest_frequency': preference.digest_frequency,
            'quiet_hours_start': preference.quiet_hours_start.isoformat() if preference.quiet_hours_start else None,
            'quiet_hours_end': preference.quiet_hours_end.isoformat() if preference.quiet_hours_end else None,
            'created_at': preference.created_at.isoformat(),
            'updated_at': preference.updated_at.isoformat()
        }
    
    @staticmethod
    def validate_data(data):
        """Valida los datos de las preferencias"""
        errors = {}
        
        # Validar enabled_types
        if 'enabled_types' in data and data['enabled_types']:
            try:
                if isinstance(data['enabled_types'], str):
                    types_list = json.loads(data['enabled_types'])
                elif isinstance(data['enabled_types'], list):
                    types_list = data['enabled_types']
                else:
                    errors['enabled_types'] = 'Formato inválido para enabled_types'
                    return errors
                
                # Validar que todos los tipos sean válidos
                valid_types = [choice[0] for choice in Notification.TYPE_CHOICES]
                for notification_type in types_list:
                    if notification_type not in valid_types:
                        errors['enabled_types'] = f'Tipo de notificación inválido: {notification_type}'
                        break
            except json.JSONDecodeError:
                errors['enabled_types'] = 'El campo enabled_types debe ser un JSON válido'
        
        # Validar horas silenciosas
        if 'quiet_hours_start' in data and data['quiet_hours_start'] and 'quiet_hours_end' in data and data['quiet_hours_end']:
            if data['quiet_hours_start'] >= data['quiet_hours_end']:
                errors['quiet_hours_start'] = 'La hora de inicio debe ser anterior a la hora de fin'
        
        return errors
    
    @staticmethod
    def create(data, user):
        """Crea nuevas preferencias"""
        with transaction.atomic():
            preference = NotificationPreference.objects.create(
                user=user,
                enabled_types=data.get('enabled_types', '[]'),
                email_enabled=data.get('email_enabled', True),
                push_enabled=data.get('push_enabled', True),
                sms_enabled=data.get('sms_enabled', False),
                digest_frequency=data.get('digest_frequency', 'daily'),
                quiet_hours_start=data.get('quiet_hours_start'),
                quiet_hours_end=data.get('quiet_hours_end')
            )
            
            return preference
    
    @staticmethod
    def update(preference, data):
        """Actualiza preferencias existentes"""
        with transaction.atomic():
            # Actualizar campos
            if 'enabled_types' in data:
                preference.enabled_types = data['enabled_types']
            if 'email_enabled' in data:
                preference.email_enabled = data['email_enabled']
            if 'push_enabled' in data:
                preference.push_enabled = data['push_enabled']
            if 'sms_enabled' in data:
                preference.sms_enabled = data['sms_enabled']
            if 'digest_frequency' in data:
                preference.digest_frequency = data['digest_frequency']
            if 'quiet_hours_start' in data:
                preference.quiet_hours_start = data['quiet_hours_start']
            if 'quiet_hours_end' in data:
                preference.quiet_hours_end = data['quiet_hours_end']
            
            preference.save()
            return preference 