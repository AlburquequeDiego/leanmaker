from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Assignment, AssignmentRole, AssignmentMilestone
from projects.models import Proyecto
from students.models import Estudiante
from companies.models import Empresa
from datetime import date

User = get_user_model()


class AssignmentModelTest(TestCase):
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
        
    def test_assignment_creation(self):
        assignment = Assignment.objects.create(
            student=self.student,
            project=self.project,
            assigned_by=self.user,
            status='pending',
            start_date=date.today(),
            notes='Test assignment'
        )
        
        self.assertEqual(assignment.student, self.student)
        self.assertEqual(assignment.project, self.project)
        self.assertEqual(assignment.status, 'pending')
        self.assertEqual(assignment.notes, 'Test assignment')
        
    def test_assignment_str(self):
        assignment = Assignment.objects.create(
            student=self.student,
            project=self.project,
            assigned_by=self.user
        )
        
        expected_str = f"{self.student} - {self.project} (Pendiente)"
        self.assertEqual(str(assignment), expected_str)


class AssignmentRoleModelTest(TestCase):
    def setUp(self):
        # Crear usuario y objetos necesarios
        self.user = User.objects.create_user(
            email='test@test.com',
            password='testpass123'
        )
        self.company = Empresa.objects.create(
            user=self.user,
            company_name='Test Company'
        )
        self.student = Estudiante.objects.create(user=self.user)
        self.project = Proyecto.objects.create(
            title='Test Project',
            company=self.company,
            description='Test description'
        )
        self.assignment = Assignment.objects.create(
            student=self.student,
            project=self.project,
            assigned_by=self.user
        )
        
    def test_assignment_role_creation(self):
        role = AssignmentRole.objects.create(
            assignment=self.assignment,
            role_name='Developer',
            description='Software developer role',
            responsibilities='Code development and testing'
        )
        
        self.assertEqual(role.assignment, self.assignment)
        self.assertEqual(role.role_name, 'Developer')
        self.assertEqual(role.description, 'Software developer role')


class AssignmentMilestoneModelTest(TestCase):
    def setUp(self):
        # Crear usuario y objetos necesarios
        self.user = User.objects.create_user(
            email='test@test.com',
            password='testpass123'
        )
        self.company = Empresa.objects.create(
            user=self.user,
            company_name='Test Company'
        )
        self.student = Estudiante.objects.create(user=self.user)
        self.project = Proyecto.objects.create(
            title='Test Project',
            company=self.company,
            description='Test description'
        )
        self.assignment = Assignment.objects.create(
            student=self.student,
            project=self.project,
            assigned_by=self.user
        )
        
    def test_milestone_creation(self):
        milestone = AssignmentMilestone.objects.create(
            assignment=self.assignment,
            title='First Milestone',
            description='Complete initial setup',
            due_date=date.today(),
            status='pending'
        )
        
        self.assertEqual(milestone.assignment, self.assignment)
        self.assertEqual(milestone.title, 'First Milestone')
        self.assertEqual(milestone.status, 'pending') 