from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRegistrationView, CustomUserViewSet

router = DefaultRouter()
router.register(r'users', CustomUserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
] 