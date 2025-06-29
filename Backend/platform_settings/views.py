from rest_framework import viewsets, permissions
from .models import PlatformSetting
from .serializers import PlatformSettingSerializer

class PlatformSettingViewSet(viewsets.ModelViewSet):
    queryset = PlatformSetting.objects.all()
    serializer_class = PlatformSettingSerializer
    permission_classes = [permissions.IsAdminUser]
