from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import WorkHour
from projects.models import Proyecto
from students.models import Estudiante
from companies.models import Empresa
from datetime import date

User = get_user_model()


class WorkHourModelTest(TestCase):
    def setUp(self):
        # Crear usuario
        self.user = User.objects.create_user(
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Crear empresa
        self.company = Empresa.objects.create(
            user=self.user,
            company_name='Test Company'
        )
        
        # Crear estudiante
        self.student = Estudiante.objects.create(
            user=self.user
        )
        
        # Crear proyecto
        self.project = Proyecto.objects.create(
            title='Test Project',
            company=self.company,
            description='Test description'
        )
        
    def test_work_hour_creation(self):
        work_hour = WorkHour.objects.create(
            student=self.student,
            project=self.project,
            date=date.today(),
            hours_worked=8.5,
            description='Test work'
        )
        
        self.assertEqual(work_hour.student, self.student)
        self.assertEqual(work_hour.project, self.project)
        self.assertEqual(work_hour.hours_worked, 8.5)
        self.assertEqual(work_hour.description, 'Test work')
        
    def test_work_hour_str(self):
        work_hour = WorkHour.objects.create(
            student=self.student,
            project=self.project,
            date=date.today(),
            hours_worked=8.5
        )
        
        expected_str = f"{self.student} - {self.project} - {date.today()} (8.5h)"
        self.assertEqual(str(work_hour), expected_str) 