from django.test import TestCase
from .models import Documents


class DocumentsModelTest(TestCase):
    def test_documents_creation(self):
        documents = Documents.objects.create(
            name='Test Documents',
            description='Test description'
        )
        
        self.assertEqual(documents.name, 'Test Documents')
        self.assertEqual(documents.description, 'Test description')
        self.assertTrue(documents.is_active)
