from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import MassNotification, NotificationTemplate

User = get_user_model()


class MassNotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
    def test_mass_notification_creation(self):
        notification = MassNotification.objects.create(
            title='Test Notification',
            message='This is a test notification',
            notification_type='in_app',
            target_audience='all',
            sent_by=self.user
        )
        
        self.assertEqual(notification.title, 'Test Notification')
        self.assertEqual(notification.message, 'This is a test notification')
        self.assertEqual(notification.notification_type, 'in_app')
        self.assertEqual(notification.target_audience, 'all')
        self.assertEqual(notification.sent_by, self.user)
        self.assertFalse(notification.is_sent)
        
    def test_mass_notification_str(self):
        notification = MassNotification.objects.create(
            title='Test Notification',
            message='This is a test notification',
            sent_by=self.user
        )
        
        expected_str = 'Test Notification - Todos los usuarios'
        self.assertEqual(str(notification), expected_str)


class NotificationTemplateModelTest(TestCase):
    def test_notification_template_creation(self):
        template = NotificationTemplate.objects.create(
            name='Welcome Template',
            subject='Welcome to our platform',
            body='Welcome message body'
        )
        
        self.assertEqual(template.name, 'Welcome Template')
        self.assertEqual(template.subject, 'Welcome to our platform')
        self.assertEqual(template.body, 'Welcome message body')
        self.assertTrue(template.is_active)
        
    def test_notification_template_str(self):
        template = NotificationTemplate.objects.create(
            name='Welcome Template',
            subject='Welcome to our platform',
            body='Welcome message body'
        )
        
        self.assertEqual(str(template), 'Welcome Template') 