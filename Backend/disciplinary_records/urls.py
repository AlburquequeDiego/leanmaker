from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DisciplinaryRecordViewSet

router = DefaultRouter()
router.register(r'records', DisciplinaryRecordViewSet, basename='disciplinary-record')

urlpatterns = [
    path('', include(router.urls)),
] 