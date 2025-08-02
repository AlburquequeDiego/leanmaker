from django.test import TestCase
from .models import Reports


class ReportsModelTest(TestCase):
    def test_reports_creation(self):
        reports = Reports.objects.create(
            name='Test Reports',
            description='Test description'
        )
        
        self.assertEqual(reports.name, 'Test Reports')
        self.assertEqual(reports.description, 'Test description')
        self.assertTrue(reports.is_active)
