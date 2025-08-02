from django.test import TestCase
from .models import Monitoring


class MonitoringModelTest(TestCase):
    def test_monitoring_creation(self):
        monitoring = Monitoring.objects.create(
            name='Test Monitoring',
            description='Test description'
        )
        
        self.assertEqual(monitoring.name, 'Test Monitoring')
        self.assertEqual(monitoring.description, 'Test description')
        self.assertTrue(monitoring.is_active)
