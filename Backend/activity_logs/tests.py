from django.test import TestCase
from .models import ActivityLogs


class ActivityLogsModelTest(TestCase):
    def test_activity_logs_creation(self):
        activity_logs = ActivityLogs.objects.create(
            name='Test Activity Logs',
            description='Test description'
        )
        
        self.assertEqual(activity_logs.name, 'Test Activity Logs')
        self.assertEqual(activity_logs.description, 'Test description')
        self.assertTrue(activity_logs.is_active)
