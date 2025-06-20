from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentProfileView, StudentViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
] 