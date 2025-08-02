from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Rating, StudentCompanyRating, CompanyStudentRating, ProjectRating
from projects.models import Proyecto
from students.models import Estudiante
from companies.models import Empresa

User = get_user_model()


class RatingModelTest(TestCase):
    def test_rating_creation(self):
        rating = Rating.objects.create(
            rating_type='student_to_company',
            rating_value=5,
            comment='Excelente experiencia'
        )
        
        self.assertEqual(rating.rating_type, 'student_to_company')
        self.assertEqual(rating.rating_value, 5)
        self.assertEqual(rating.comment, 'Excelente experiencia')
        
    def test_rating_str(self):
        rating = Rating.objects.create(
            rating_type='student_to_company',
            rating_value=4
        )
        
        expected_str = 'Estudiante a Empresa - 4/5'
        self.assertEqual(str(rating), expected_str)


class StudentCompanyRatingModelTest(TestCase):
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
        self.rating = Rating.objects.create(
            rating_type='student_to_company',
            rating_value=5
        )
        
    def test_student_company_rating_creation(self):
        student_company_rating = StudentCompanyRating.objects.create(
            student=self.student,
            company=self.company,
            project=self.project,
            rating=self.rating
        )
        
        self.assertEqual(student_company_rating.student, self.student)
        self.assertEqual(student_company_rating.company, self.company)
        self.assertEqual(student_company_rating.project, self.project)
        self.assertEqual(student_company_rating.rating, self.rating)
        
    def test_student_company_rating_str(self):
        student_company_rating = StudentCompanyRating.objects.create(
            student=self.student,
            company=self.company,
            project=self.project,
            rating=self.rating
        )
        
        expected_str = f"{self.student} → {self.company} (5/5)"
        self.assertEqual(str(student_company_rating), expected_str)


class CompanyStudentRatingModelTest(TestCase):
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
        self.rating = Rating.objects.create(
            rating_type='company_to_student',
            rating_value=4
        )
        
    def test_company_student_rating_creation(self):
        company_student_rating = CompanyStudentRating.objects.create(
            company=self.company,
            student=self.student,
            project=self.project,
            rating=self.rating
        )
        
        self.assertEqual(company_student_rating.company, self.company)
        self.assertEqual(company_student_rating.student, self.student)
        self.assertEqual(company_student_rating.project, self.project)
        self.assertEqual(company_student_rating.rating, self.rating)
        
    def test_company_student_rating_str(self):
        company_student_rating = CompanyStudentRating.objects.create(
            company=self.company,
            student=self.student,
            project=self.project,
            rating=self.rating
        )
        
        expected_str = f"{self.company} → {self.student} (4/5)"
        self.assertEqual(str(company_student_rating), expected_str)


class ProjectRatingModelTest(TestCase):
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
        self.project = Proyecto.objects.create(
            title='Test Project',
            company=self.company,
            description='Test description'
        )
        self.rating = Rating.objects.create(
            rating_type='student_to_project',
            rating_value=5
        )
        
    def test_project_rating_creation(self):
        project_rating = ProjectRating.objects.create(
            project=self.project,
            rated_by=self.user,
            category='overall',
            rating=self.rating
        )
        
        self.assertEqual(project_rating.project, self.project)
        self.assertEqual(project_rating.rated_by, self.user)
        self.assertEqual(project_rating.category, 'overall')
        self.assertEqual(project_rating.rating, self.rating)
        
    def test_project_rating_str(self):
        project_rating = ProjectRating.objects.create(
            project=self.project,
            rated_by=self.user,
            category='overall',
            rating=self.rating
        )
        
        expected_str = f"{self.project} - General (5/5)"
        self.assertEqual(str(project_rating), expected_str) 