from django.test import TestCase
from .models import DisciplinaryRecords


class DisciplinaryRecordsModelTest(TestCase):
    def test_disciplinary_records_creation(self):
        disciplinary_records = DisciplinaryRecords.objects.create(
            name='Test Disciplinary Records',
            description='Test description'
        )
        
        self.assertEqual(disciplinary_records.name, 'Test Disciplinary Records')
        self.assertEqual(disciplinary_records.description, 'Test description')
        self.assertTrue(disciplinary_records.is_active)
