from django.test import TestCase
from .models import DataBackups


class DataBackupsModelTest(TestCase):
    def test_data_backups_creation(self):
        data_backups = DataBackups.objects.create(
            name='Test Data Backups',
            description='Test description'
        )
        
        self.assertEqual(data_backups.name, 'Test Data Backups')
        self.assertEqual(data_backups.description, 'Test description')
        self.assertTrue(data_backups.is_active)
