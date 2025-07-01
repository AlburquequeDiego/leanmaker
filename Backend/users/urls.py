from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, AuthViewSet, PasswordViewSet, DashboardViewSet, UserRegistrationView, TestAuthView, EmailTokenObtainPairView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'passwords', PasswordViewSet, basename='password')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('test-auth/', TestAuthView.as_view(), name='test-auth'),
    path('token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
] 
