from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyProfileView, CompanyViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', CompanyProfileView.as_view(), name='company-profile'),
] 
