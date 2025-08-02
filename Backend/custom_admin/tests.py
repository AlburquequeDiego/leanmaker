from django.test import TestCase
from .models import CustomAdmin


class CustomAdminModelTest(TestCase):
    def test_custom_admin_creation(self):
        custom_admin = CustomAdmin.objects.create(
            name='Test Custom Admin',
            description='Test description'
        )
        
        self.assertEqual(custom_admin.name, 'Test Custom Admin')
        self.assertEqual(custom_admin.description, 'Test description')
        self.assertTrue(custom_admin.is_active)
